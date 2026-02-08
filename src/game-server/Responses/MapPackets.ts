import type { Npc } from '../GameState/Npc/Npc';
import type { Pet } from '../GameState/Pet/Pet';
import { Player } from '../GameState/Player/Player';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import { MapCharacterStruct } from './Structs/MapCharacterStruct';
import { MapMoveStruct } from './Structs/MapMoveStruct';

export abstract class MapPackets {
	/**
	 * Opens the map.
	 * Client needs to have recieved packet MapData before this.
	 * Only used on the first map, MapChange is used afterwards.
	 */
	public static enter: Packet = new Packet(16, PacketType.MapEnter);

	/**
	 * Opens a new map.
	 */
	public static change: Packet = new Packet(16, PacketType.MapChange);

	/**
	 * Update coordinates (dest x/y) of people.
	 * @param player
	 */
	public static walkDestinations(players: Player[]): Packet {
		let packet = new Packet(16 + 12 * players.length, PacketType.WalkDestinations).uint32(
			12,
			players.length,
		);

		for (let i = 0; i < players.length; ++i)
			packet.struct(16 + i * 12, MapMoveStruct, players[i]);

		return packet;
	}

	/**
	 * Update coordinates of people.
	 * Sets both the x/y and the destination x/y to the same.
	 * @param player
	 */
	public static updateCoordinates(players: Player[]): Packet {
		let packet = new Packet(16 + 12 * players.length, PacketType.UpdateCoordinates).uint32(
			12,
			players.length,
		);

		for (let i = 0; i < players.length; ++i)
			packet.struct(16 + i * 12, MapMoveStruct, players[i]);

		return packet;
	}

	/**
	 * Add npcs/players to the map.
	 * @param player
	 */
	public static npcAdd(npcs: (Player | Npc)[]): Packet {
		let packet = new Packet(
			16 + npcs.length * MapCharacterStruct.size,
			PacketType.NpcAdd,
		).uint32(12, npcs.length);

		for (let i = 0; i < npcs.length; ++i)
			packet.struct(16 + MapCharacterStruct.size * i, MapCharacterStruct, npcs[i]);

		return packet;
	}

	/**
	 * Remove npcs/players from the map.
	 * @param players
	 */
	public static npcRemove(npcs: (Player | Npc | Pet)[]): Packet {
		let packet = new Packet(16 * npcs.length * 4, PacketType.NpcRemove).uint32(12, npcs.length);

		for (let i = 0; i < npcs.length; ++i) packet.uint32(16 + i * 4, npcs[i].id);

		return packet;
	}

	/**
	 * Loads all characters on the map.
	 * @param player the player this will be sent to
	 */
	public static npcList(player: Player): Packet {
		let map = player.mapData.map;
		let inds = [...map.players.values(), ...map.npcs];
		inds.splice(inds.indexOf(player), 1);

		let packet = new Packet(
			16 + MapCharacterStruct.size * inds.length,
			PacketType.NpcList,
		).uint32(12, inds.length);

		for (let i = 0; i < inds.length; ++i)
			packet.struct(16 + 84 * i, MapCharacterStruct, inds[i]);

		return packet;
	}

	/**
	 * Load a new map with player map data.
	 * @param player
	 */
	public static mapData(player: Player): Packet[] {
		let map = player.mapData.map;

		let packet1 = new Packet(188, PacketType.MapData)
			.uint16(6, 172)
			.string(16, map.name, 12)
			.uint32(32, map.file)
			.uint32(36, map.musicFile)
			.uint32(40, map.minimapFile ?? 0)
			.uint32(44, map.fightMusicFile)
			.uint32(48, map.fightBackgroundFile)
			// 52 boss fight music
			// 56 boss fight background
			// 60 fighting enabled
			.uint32(60, 1)
			// 64 reputation blocks pk or potion can block random fights?
			// 68 pk enabled
			.uint32(72, map.minimapEnabled ? 1 : 0)
			.uint32(76, map.weather)
			// 80 - 104 weather effects on gold, mobs, etc
			.struct(104, MapCharacterStruct, player);

		let packet2 = new Packet(16, PacketType.EnableMinimap).uint8(
			12,
			map.minimapEnabled ? 1 : 0,
		);

		return [packet1, packet2];
	}

	/**
	 * Used for sending when players join game and change maps
	 * @param inds
	 */
	public static sendVendorOpenPackets(inds: (Player | Npc)[]): void {
		for (const npc of inds) {
			if (npc instanceof Player && npc.memory.vendorName) {
				npc.sendVendorOpenToMap(npc.memory.vendorName);
			}
		}
	}
}
