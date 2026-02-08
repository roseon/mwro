import type { Fight } from '../GameState/Fight/Fight';
import type { FightActionResult } from '../GameState/Fight/FightActionResultTypes';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import { FightMemberStatStruct } from './Structs/FightMemberStatStruct';
import { FightMemberStruct } from './Structs/FightMemberStruct';

export abstract class FightPackets {
	/**
	 * Used when all players are ready to start.
	 * Stops the 20 second timedown.
	 */
	public static go: Packet = new Packet(16, PacketType.FightGo);

	/**
	 * Used when the fight is over.
	 */
	public static end: Packet = new Packet(16, PacketType.FightEnd);

	/**
	 * Sent before the server executes a fight action.
	 */
	public static turnPause: Packet = new Packet(16, PacketType.FightTurnPause);

	/**
	 * Tells the client to open a fight.
	 * @param fight
	 */
	public static start(fight: Fight): Packet {
		let count = fight.members.size;
		let packet = new Packet(16 + count * 68, PacketType.FightStart).uint32(12, count);
		let offset = 16;

		for (let member of fight.members.values()) {
			packet.struct(offset, FightMemberStruct, member);
			offset += 68;
		}

		return packet;
	}

	/**
	 * The result of a turn.
	 * @param result
	 */
	public static actionResult(result: FightActionResult): Packet {
		let length = 40 + result.stats.length * 28 + result.magic.length * 12;

		if (result.data) length += result.data.length;

		let packet = new Packet(length, PacketType.FightActionResult)
			.uint16(6, length - 12)
			.uint16(16, result.type)
			// 18?
			.uint32(20, result.source)
			.uint32(24, result.target)
			.uint32(28, result.detail ?? 0)
			.uint8(32, result.stats.length)
			.uint8(33, result.magic.length)
			// 34?
			.uint32(36, result.data?.length ?? 0);

		let offset = 40;

		for (let member of result.stats) {
			packet
				.uint32(offset, member.base.id)
				.struct(offset + 4, FightMemberStatStruct, member)
				// 22?
				.uint32(offset + 24, member.effect.value);

			offset += 28;
		}

		for (let skill of result.magic) {
			packet
				.uint32(offset, skill.id)
				.uint32(offset + 4, skill.damage)
				.uint32(offset + 8, skill.repel);
			offset += 12;
		}

		if (result.data) packet.binary(offset, result.data);

		return packet;
	}

	/**
	 * Tells the client to start the next turn, and whose turn it is.
	 * @param id
	 */
	public static turnContinue(id: number): Packet {
		return new Packet(16, PacketType.FightTurnContinue).uint32(12, id);
	}
}
