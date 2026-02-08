import type { SkillData } from '../../GameState/SkillData';
import { SkillsGroup } from '../../GameState/Skills/SkillsGroup';
import type { Packet } from '../../PacketBuilder';
import { Logger } from '../../Logger/Logger';

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
