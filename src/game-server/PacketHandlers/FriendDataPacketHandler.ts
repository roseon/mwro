import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';
import { Logger } from '../Logger/Logger';
import { FriendPackets } from '../Responses/FriendPackets';
import type { Player } from '../GameState/Player/Player';
import { getTitleById } from '../Updater/Data/TitleData';

/**
 * Handles packets regarding friend data.
 */
export class FriendDataPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return (
			type === PacketType.ChatFriendList ||
			type === PacketType.ChatFriendAdd ||
			type === PacketType.ChatFriendDelete ||
			type === PacketType.ChatFriendInfo ||
			type === PacketType.ChatFriendOnline ||
			type === PacketType.ChatFriendOffline ||
			type === PacketType.ChatFriendUpdate ||
			type === PacketType.ChatFriendSearch
		);
	}

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public handlePacket(packet: Buffer, client: PacketConnection): void {
		if (!this.hasPlayer(client)) return;

		let type = getPacketType(packet);

		switch (type) {
			case PacketType.ChatFriendAdd:
				this.chatFriendAdd(packet, client);
				break;
			case PacketType.ChatFriendDelete:
				this.chatFriendDelete(packet, client);
				break;
			case PacketType.ChatFriendInfo:
				this.chatFriendInfo(packet, client);
				break;
			case PacketType.ChatFriendUpdate:
				this.chatFriendChange(packet, client);
				break;
			case PacketType.ChatFriendSearch:
				this.chatFriendSearch(packet, client);
				break;
			default:
				this.notImplemented(packet);
		}
	}

	private async chatFriendAdd(packet: Buffer, client: PlayerConnection): Promise<void> {
		const targetID = packet.readUInt16LE(12);
		const targetPlayer = client.game.players.get(targetID);

		if (client.player.friends.addFriend(targetID)) {
			// Save the updated friend list
			await client.player.playerCollection?.updatePlayer(client.player);

			if (targetPlayer) {
				targetPlayer.client?.write(FriendPackets.friendOnline(client.player.id));
				targetPlayer.client?.write(FriendPackets.friendAddRecipient(client.player.name));

				let title = null;
				if (targetPlayer.titles.title) {
					title = getTitleById(targetPlayer.titles.title);
				}

				client.write(
					FriendPackets.friendAddSender(
						targetPlayer.id,
						targetPlayer.name,
						title?.name ?? '',
						targetPlayer.level.reborn,
						targetPlayer.level.level,
						targetPlayer.class,
						targetPlayer.guild?.name ?? '',
					),
				);

				Logger.info(
					`Friend request sent from ${client.player.name} to ${targetPlayer.name}`,
				);
			}
		}
	}

	private async chatFriendDelete(packet: Buffer, client: PlayerConnection): Promise<void> {
		let targetID = packet.readUInt16LE(12);
		client.write(FriendPackets.friendDelete(targetID));
		client.player.friends.removeFriend(targetID);
		await client.player.playerCollection?.updatePlayer(client.player);
		Logger.info('ChatFriendDelete');
		Logger.info(packet);
	}

	private chatFriendInfo(packet: Buffer, client: PlayerConnection): void {
		const targetID = packet.readUInt16LE(12);
		const targetPlayer = client.game.players.get(targetID);

		if (targetPlayer) {
			let title = null;
			if (targetPlayer.titles.title) {
				title = getTitleById(targetPlayer.titles.title);
			}

			client.write(
				FriendPackets.friendInfo(
					targetPlayer.id,
					targetPlayer.name,
					title?.name ?? '',
					targetPlayer.level.reborn,
					targetPlayer.level.level,
					targetPlayer.class,
					targetPlayer.guild?.name ?? '',
				),
			);
		}

		Logger.info('ChatFriendInfo');
		Logger.info(packet);
	}

	private chatFriendChange(packet: Buffer, client: PlayerConnection): void {
		let targetID = packet.readUInt16LE(12);
		let friendshipStatus = packet.readUInt8(16);
		client.write(FriendPackets.friendUpdate(targetID, friendshipStatus));
	}

	private chatFriendSearch(packet: Buffer, client: PlayerConnection): void {
		const isNameSearch = packet.readUInt32LE(12) === 1;

		let foundPlayer: Player | null = null;

		if (isNameSearch) {
			const name = packet.toString('utf-8', 16).replace(/\0+$/, '');

			for (const [_, player] of client.game.players) {
				if (player.name.toLowerCase() === name.toLowerCase()) {
					foundPlayer = player;
					break;
				}
			}
		} else {
			const id = packet.readUInt32LE(16);
			foundPlayer = client.game.players.get(id) ?? null;
		}

		if (foundPlayer) {
			const foundStatus = 0;
			client.write(
				FriendPackets.friendSearch(
					foundStatus,
					foundPlayer.name,
					foundPlayer.id,
					foundPlayer.race,
					foundPlayer.gender,
					foundPlayer.level.reborn,
					foundPlayer.level.level,
				),
			);
		} else {
			const foundStatus = 1;
			client.write(FriendPackets.friendSearch(foundStatus, undefined, undefined, undefined));
		}

		Logger.info(packet);
	}
}
