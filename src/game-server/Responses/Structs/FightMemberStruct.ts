import type { FightMember } from '../../GameState/Fight/FightMember';
import { Pet } from '../../GameState/Pet/Pet';
import { Player } from '../../GameState/Player/Player';
import type { Packet } from '../../PacketBuilder';
import { FightMemberStatStruct } from './FightMemberStatStruct';

export abstract class FightMemberStruct {
	public static readonly size: number = 68;

	/**
	 * Writes the data of a character in battle to the packet.
	 * @param packet
	 * @param offset
	 * @param member
	 */
	public static write(packet: Packet, offset: number, member: FightMember): void {
		packet
			.uint8(offset, member.location)
			.uint8(offset + 4, member.active ? 1 : 0)
			.uint32(offset + 8, member.base.id)
			.string(offset + 12, member.base.name, 14)
			.struct(offset + 36, FightMemberStatStruct, member)
			.uint16(offset + 54, member.base.file)
			.uint8(offset + 56, member.type)
			.uint32(offset + 60, member.effect.value);

		if (member.base instanceof Player || member.base instanceof Pet)
			packet.uint8(offset + 64, member.base.level.reborn);
	}
}
