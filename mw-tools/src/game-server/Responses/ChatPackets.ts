import { getConfig } from '../Config/Config';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import type { MailItem } from '../GameState/Player/PlayerMail';
import { Logger } from '../Logger/Logger';

export abstract class ChatPackets {
	private static _serverInfo: Packet | null = null;

	/**
	 * Sent after picking a character.
	 * Contains the ip/port of the chat server.
	 */
	public static get serverInfo(): Packet {
		if (this._serverInfo === null) {
			let { chat } = getConfig();
			let ip = chat.ip.split('.').map(s => Number.parseInt(s));
			let port = chat.port;

			this._serverInfo = new Packet(22, PacketType.ChatServerInfo)
				.uint8(16, ip[0])
				.uint8(17, ip[1])
				.uint8(18, ip[2])
				.uint8(19, ip[3])
				.uint16(20, port);
		}

		return this._serverInfo;
	}

	/**
	 * A local chat message.
	 * @param sender
	 * @param message
	 */
	public static local(sender: number, message: string): Packet {
		return new Packet(16 + message.length, PacketType.ChatLocalBS)
			.uint16(6, message.length)
			.uint32(12, sender)
			.string(16, message);
	}

	/**
	 * A party chat message.
	 * @param sender
	 * @param message
	 */
	public static party(sender: number, message: string): Packet {
		let packet = new Packet(16 + message.length, PacketType.ChatPartyBS)
			.uint16(6, message.length)
			.uint32(12, sender)
			.string(16, message);
		console.log('Party message by server:', packet);
		return packet;
	}

	/**
	 * A market chat message.
	 * @param sender
	 * @param message
	 */
	public static market(sender: number, message: string, sender_name: string): Packet {
		return new Packet(33 + message.length, PacketType.ChatMarketBS)
			.uint32(16, sender)
			.uint16(20, 9) //name length?
			.uint8(21, message.length)
			.string(24, sender_name)
			.string(24 + 9, message);
	}

	/**
	 * A market chat message that indicates a failure.
	 * This is used when the market chat fails to send or is missing a buy/sell message
	 */
	public static marketFail(): Packet {
		return new Packet(16, PacketType.ChatMarketBS).uint32(12, 4294967295);
	}

	/**
	 * A world chat message.
	 * @param sender
	 * @param message
	 */
	public static world(sender: number, name: string, message: string): Packet {
		return new Packet(24 + name.length + message.length, PacketType.ChatWorldBS)
			.uint16(6, 8 + name.length + message.length)
			.uint32(16, sender)
			.uint8(20, name.length)
			.uint8(21, message.length)
			.string(24, name)
			.string(24 + name.length, message);
	}

	public static mailOpen(mail: MailItem, recipientID: number): Packet {
		let packet = new Packet(
			32 + mail.mailAuthorName.length + mail.mailMessage.length,
			PacketType.ChatMail,
		)
			.uint16(16, mail.mailAuthorID)
			.uint16(20, recipientID) // Using mailID as recipientID
			.int32(24, mail.mailTimestamp)
			.uint8(28, mail.mailAuthorName.length)
			.uint8(29, mail.mailMessage.length)
			.string(32, mail.mailAuthorName)
			.string(32 + mail.mailAuthorName.length, mail.mailMessage);

		return packet;
	}

	public static mailAlert(mailCount: number): Packet {
		let packet = new Packet(16, PacketType.ChatNewMail).uint8(12, mailCount);
		Logger.info('Mail Alert: ' + mailCount);
		Logger.info(packet.buffer.toString('hex'));
		return packet;
	}

	public static privateRecipient(
		sender: number,
		recipient: number,
		recipientName: string,
		length: number,
		message: string,
	): Packet {
		return new Packet(28 + length + recipientName.length, PacketType.Chat40084)
			.uint32(16, sender)
			.uint32(20, recipient)
			.uint8(24, recipientName.length)
			.uint8(25, length)
			.string(28, recipientName)
			.string(28 + recipientName.length, message);
	}
	public static privateSender(
		sender: number,
		recipient: number,
		recipientName: string,
		length: number,
		message: string,
	): Packet {
		return new Packet(28 + length + recipientName.length, PacketType.Chat40084)
			.uint32(16, recipient)
			.uint32(20, sender)
			.uint8(24, recipientName.length)
			.uint8(25, length)
			.string(28, recipientName)
			.string(28 + recipientName.length, message);
	}
}
