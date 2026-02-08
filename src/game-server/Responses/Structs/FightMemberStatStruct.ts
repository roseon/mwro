import type { FightMember } from '../../GameState/Fight/FightMember';
import type { Packet } from '../../PacketBuilder';

export abstract class FightMemberStatStruct {
	public static readonly size: number = 18;

	/**
	 * Writes the base stats a character in battle to the packet.
	 * @param packet
	 * @param offset
	 * @param member
	 */
	public static write(packet: Packet, offset: number, member: FightMember): void {
		packet
			.uint32(offset, member.base.fightData.stats.hp.stat)
			.uint32(offset + 4, member.base.fightData.stats.currentHp)
			.uint32(offset + 8, member.base.fightData.stats.mp.stat)
			.uint32(offset + 12, member.base.fightData.stats.currentMp)
			// TODO uint8/uint16? Related to chargefill
			// hardcoded to a value to prevent crashing with certain AGI numbers
			.uint16(offset + 16, 1);
	}
}
