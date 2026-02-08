import { PlayerCollection } from '../Database/Collections/Player/PlayerCollection';
import { MailItem } from '../GameState/Player/PlayerMail';
import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import { ChatPackets } from '../Responses/ChatPackets';
import { MessagePackets } from '../Responses/MessagePackets';
import { ChatConnection } from '../Server/Chat/ChatConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { endAtZero } from '../Utils/StringUtils';
import { AbstractPacketHandler } from './AbstractPacketHandler';
import { sanitizeChatMessage } from '../Utils/StringUtils';
import { ChatCooldownManager } from '../Utils/ChatCooldownManager';
import { Logger } from '../Logger/Logger';

/**
 * Handles chat packets.
 */
export class ChatPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type >= 0x00040074 && type < 0x00050000;
	}

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public handlePacket(packet: Buffer, client: PacketConnection): void {
		if (!(client instanceof ChatConnection)) return;

		let type = getPacketType(packet);

		switch (type) {
			case PacketType.ChatLocalBC:
				this.onLocalChat(packet, client);
				break;
			case PacketType.ChatPartyBC:
				this.onPartyChat(packet, client);
				break;
			//ChatGuildBC
			case PacketType.ChatMarketBC:
				this.onMarketChat(packet, client);
				break;
			case PacketType.ChatWorldBC:
				this.onWorldChat(packet, client);
				break;
			case PacketType.ChatPMBC:
				this.onPrivateChat(packet, client);
				break;
			//ChatGMBC
			case PacketType.ChatMailSend:
				this.onMailSend(packet, client);
				break;
			case PacketType.ChatOpenMail:
				this.onMailOpen(packet, client);
				break;
			case PacketType.ChatNewMailQ:
				this.onLoginMail(packet, client);
				break;
			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * The client sent a local chat message.
	 * @param packet
	 * @param client
	 */
	private onLocalChat(packet: Buffer, client: ChatConnection): void {
		let sender = packet.readUInt32LE(12);
		if (sender !== client.player.id) return;

		if (!ChatCooldownManager.getInstance().canSendMessage(client.player.id, 'local')) {
			return;
		}

		let message = endAtZero(packet.toString('ascii', 16));
		message = sanitizeChatMessage(message);

		client.channelWriter.local(ChatPackets.local(client.player.id, message), client);
	}

	private async onPartyChat(packet: Buffer, client: ChatConnection): Promise<void> {
		console.log('Party message by client:', packet);
		let sender = packet.readUInt32LE(12);
		if (sender !== client.player.id) {
			return;
		}
		if (!ChatCooldownManager.getInstance().canSendMessage(client.player.id, 'party')) {
			return;
		}

		let message = endAtZero(packet.toString('ascii', 16));
		message = sanitizeChatMessage(message);

		console.log('Party message by client:', message);
		client.channelWriter.party(ChatPackets.party(client.player.id, message), client);
	}

	/**
	 * The client sent a market chat message.
	 * @param packet
	 * @param client
	 */
	private async onMarketChat(packet: Buffer, client: ChatConnection): Promise<void> {
		let sender = packet.readUInt32LE(16);
		if (sender !== client.player.id) {
			return;
		}
		let length = packet.readUInt16LE(21);
		let message = endAtZero(packet.toString('ascii', 24));
		message = sanitizeChatMessage(message);

		if (!ChatCooldownManager.getInstance().canSendMessage(client.player.id, 'market')) {
			return;
		}
		// Check if message contains "Sell" or "Buy" (case-insensitive) mw2 does this in the client but i can't see if mw1 can
		if (message.toLowerCase().includes('sell') || message.toLowerCase().includes('buy')) {
			client.channelWriter.market(
				ChatPackets.market(client.player.id, message, client.player.name),
			);
		} else {
			client.write(ChatPackets.marketFail());
		}
	}

	/**
	 * The client sent a world chat message.
	 * @param packet
	 * @param client
	 */
	private onWorldChat(packet: Buffer, client: ChatConnection): void {
		let sender = packet.readUInt32LE(16);
		if (sender !== client.player.id) return;

		if (!ChatCooldownManager.getInstance().canSendMessage(client.player.id, 'world')) {
			return;
		}

		let message = endAtZero(packet.toString('ascii', 24));
		message = sanitizeChatMessage(message);

		client.channelWriter.world(
			ChatPackets.world(client.player.id, client.player.name, message),
		);
	}

	private async onMailSend(packet: Buffer, client: ChatConnection): Promise<void> {
		let authorID = packet.readUInt32LE(16);
		let recipientID = packet.readUInt32LE(20);
		let status = packet.readUInt8(29);
		let message = endAtZero(packet.toString('ascii', 32));
		const currentTimestamp = Math.floor(Date.now() / 1000);

		if (authorID !== client.player.id) return;
		let playerCollection = PlayerCollection.getInstance();
		let recipientPlayer;
		try {
			recipientPlayer = await playerCollection.getPlayer(recipientID, client.player.client!);
		} catch (error) {
			return;
		}

		// Create new mail item
		const mailItem = new MailItem(
			authorID,
			message,
			client.player.name,
			recipientPlayer.pendingMail.mailCount,
			currentTimestamp,
		);

		// Add mail to recipient's pending mail
		if (!recipientPlayer.pendingMail.addMail(mailItem)) {
			client.write(MessagePackets.showMessage("Player's mailbox is full!"));
			return;
		}

		let mailCount = recipientPlayer.pendingMail.mailCount;

		// Update the player in the collection
		await playerCollection.updatePlayer(recipientPlayer);

		// Send mail alert to recipient
		try {
			await playerCollection.updatePlayer(recipientPlayer);

			// Send mail alert to recipient through the channel writer
			client.channelWriter.sendToPlayer(
				recipientID,
				ChatPackets.mailAlert(recipientPlayer.pendingMail.mailCount),
			);

			// Log successful mail send
			Logger.info(`Mail sent from ${authorID} to ${recipientID}`);
		} catch (error) {
			Logger.error(`Failed to save mail for recipient ${recipientID}: ${error}`);
			client.write(MessagePackets.showMessage('Failed to send mail. Please try again.'));
		}
	}

	private async onMailOpen(packet: Buffer, client: ChatConnection): Promise<void> {
		try {
			// Reload player data from database to ensure we have latest mail
			const playerCollection = PlayerCollection.getInstance();
			const updatedPlayer = await playerCollection.getPlayer(
				client.player.id,
				client.player.client!,
			);

			// Update the chat connection's player instance with the fresh data
			client.player.pendingMail = updatedPlayer.pendingMail;

			const pendingMails = client.player.pendingMail.getMails();

			// Check if there are any pending mails
			if (pendingMails.length === 0) {
				Logger.info('No pending mails to open');
				return;
			}

			client.write(ChatPackets.mailOpen(pendingMails[0], client.player.id));

			if (client.player.pendingMail.deleteMail(pendingMails[0].mailID)) {
				await playerCollection.updatePlayer(client.player);
			} else {
				Logger.error('Failed to delete mail: ' + pendingMails[0].mailID);
			}
		} catch (error) {
			Logger.error('Error in onMailOpen: ' + error);
		}
	}

	private async onLoginMail(packet: Buffer, client: ChatConnection): Promise<void> {
		try {
			const playerCollection = PlayerCollection.getInstance();
			const updatedPlayer = await playerCollection.getPlayer(
				client.player.id,
				client.player.client!,
			);
			const recipientID = updatedPlayer.id;
			client.player.pendingMail = updatedPlayer.pendingMail;

			const mailCount = client.player.pendingMail.getMailCount();
			if (mailCount > 0) {
				// Send the alert after a couple seconds
				setTimeout(() => {
					client.channelWriter.sendToPlayer(
						recipientID,
						ChatPackets.mailAlert(mailCount),
					);
				}, 3000);
			}
		} catch (error) {
			Logger.error('Error checking login mail: ' + error);
		}
	}

	/**
	 * The client sent a private chat message.
	 * @param packet
	 * @param client
	 */
	private async onPrivateChat(packet: Buffer, client: ChatConnection): Promise<void> {
		let sender = packet.readUInt32LE(16);
		if (sender !== client.player.id) {
			return;
		}

		if (!ChatCooldownManager.getInstance().canSendMessage(client.player.id, 'private')) {
			return;
		}

		let recipient = packet.readUInt32LE(20);

		// Get the recipient's player data from the database
		let playerCollection = PlayerCollection.getInstance();
		let recipientPlayer;
		try {
			recipientPlayer = await playerCollection.getPlayer(recipient, client.player.client!);
		} catch (error) {
			return;
		}

		let message = endAtZero(packet.toString('ascii', 28));
		message = sanitizeChatMessage(message);

		let responsePacket1 = ChatPackets.privateRecipient(
			client.player.id,
			recipient,
			recipientPlayer.name,
			message.length,
			message,
		);
		let responsePacket2 = ChatPackets.privateSender(
			recipient,
			client.player.id,
			recipientPlayer.name,
			message.length,
			message,
		);

		// Send to recipient
		client.channelWriter.private(responsePacket1, recipient);

		client.write(responsePacket2);
	}
}
