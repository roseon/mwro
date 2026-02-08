import type { Player } from '../GameState/Player/Player';
import { Logger } from '../Logger/Logger';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import { getTitleById } from '../Updater/Data/TitleData';

export abstract class FriendPackets {
	/**
	 * A local chat message.
	 * @param sender
	 * @param message
	 */
	public static friendSearch(
		foundStatus: number,
		name?: string,
		id?: number,
		race?: number,
		gender?: number,
		reborn?: number,
		level?: number,
	): Packet {
		const packet = new Packet(44, PacketType.ChatFriendSearch)
			.uint16(6, 28) //header
			.uint8(12, foundStatus) //0 = Found, 1 = Not Found
			.uint16(16, id ?? 0) //Player ID
			.string(20, name ?? '', 14) //Player Name
			.uint8(35, race ?? 0) //Race
			.uint8(36, gender ?? 0) //Gender
			.uint8(38, reborn ?? 0) //Rebirth
			.uint8(40, level ?? 0); //Level

		Logger.info(packet);
		return packet;
	}

	public static friendList(
		friends: {
			id: number;
			points: number;
		}[],
		players: Map<number, Player>,
	): Packet {
		const headerSize = 12;
		const friendEntrySize = 84;
		const totalSize = headerSize + 8 + friendEntrySize * friends.length;
		const packet = new Packet(totalSize, PacketType.ChatFriendList).uint16(12, friends.length); // amount of friends

		let currentOffset = 20;

		for (const { id, points } of friends) {
			let player = players.get(id);
			let name = player?.name ?? '';

			let title_id = player?.titles.title;
			let title = title_id ? getTitleById(title_id)?.name ?? '' : '';

			let reborn = player?.level.reborn ?? 0;
			let level = player?.level.level ?? 0;
			let classchar = player?.class ?? 0;
			let guild = player?.guild?.name ?? '';

			packet
				.uint16(currentOffset, id) // id
				.string(currentOffset + 5, name, 14) // name
				.string(currentOffset + 20, title, 27) // title
				.uint8(currentOffset + 48, reborn) // rebirth
				.uint8(currentOffset + 50, level) // level
				.uint8(currentOffset + 52, classchar) // class
				.string(currentOffset + 56, guild, 14) // guild
				.uint16(currentOffset + 76, points); // friendship points

			currentOffset += friendEntrySize;
		}

		Logger.info(packet);
		return packet;
	}

	public static friendAddRecipient(name: string): Packet {
		const packet = new Packet(32, PacketType.ChatFriendAdd)
			.uint16(6, 16)
			.uint8(12, 1)
			.string(16, name, 14); //Name of player adding OR 01-00-00-00
		Logger.info(packet);
		//Used to alert when someone adds you as a friend
		return packet;
	}
	public static friendAddSender(
		playerID: number,
		name: string,
		title: string,
		reborn: number,
		level: number,
		race: number,
		guildname: string,
	): Packet {
		const packet = new Packet(100, PacketType.ChatFriendAdd)
			.uint16(6, 84)
			.uint16(16, 1) //amount of friends
			.uint16(20, playerID) //id
			.string(25, name, 14) //name
			.string(40, title, 27) //title
			.uint8(68, reborn) //rebirth
			.uint8(70, level) //level
			.uint8(72, race) //class
			.string(76, guildname, 14) //guild
			.uint16(96, 1); //friendship points

		return packet;
	}

	public static friendDelete(targetID: number): Packet {
		const packet = new Packet(32, PacketType.ChatFriendDelete)
			.uint16(6, 16) //header
			.uint16(12, targetID); //player id

		return packet;
	}

	public static friendInfo(
		targetID: number,
		name: string,
		title: string,
		reborn: number,
		level: number,
		race: number,
		guildname: string,
	): Packet {
		const packet = new Packet(100, PacketType.ChatFriendInfo)
			.uint16(6, 84) //header
			.uint16(16, 1) //amount of friends
			.uint16(20, targetID) //id
			.string(25, name, 14) //name
			.string(40, title, 27) //title
			.uint8(68, reborn) //rebirth
			.uint8(70, level) //level
			.uint8(72, race) //class
			.string(76, guildname, 14) //guild
			.uint16(96, 1); //friendship points

		return packet;
	}

	public static friendOnline(playerID: number): Packet {
		const packet = new Packet(18, PacketType.ChatFriendOnline)
			.uint16(6, 16) //header
			.uint16(12, playerID) //player id
			.uint8(16, 1); //Online status?

		return packet;
	}

	public static friendOffline(playerID: number): Packet {
		const packet = new Packet(18, PacketType.ChatFriendOffline)
			.uint16(6, 16) //header
			.uint16(12, playerID) //player id
			.uint8(16, 0); //Online status?

		return packet;
	}

	public static friendUpdate(targetID: number, friendshipStatus: number): Packet {
		const packet = new Packet(32, PacketType.ChatFriendUpdate)
			.uint16(6, 16) //header
			.uint16(12, targetID) //player id
			.uint8(16, friendshipStatus); //friendship status

		return packet;
	}
}
