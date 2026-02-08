import type { SkillData } from '../../GameState/SkillData';
import type { Packet } from '../../PacketBuilder';

export abstract class PlayerSkillStruct {
	public static readonly size: number = 10;

	/**
	 * Writes the data of a skill to the packet.
	 * @param packet
	 * @param offset
	 * @param skill
	 */
	public static write(packet: Packet, offset: number, skill: SkillData): void {
		packet
			.uint16(offset, skill.id)
			.uint16(offset + 2, skill.level)
			.uint16(offset + 4, skill.exp);
		// 6/8 ?
	}
}
