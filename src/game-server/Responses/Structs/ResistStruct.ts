import type { Resist } from '../../GameState/Resist';
import type { Packet } from '../../PacketBuilder';

export abstract class ResistStruct {
	public static readonly size: number = 60;

	/**
	 * Write resist data to the packet.
	 * @param packet
	 * @param offset
	 * @param resist
	 */
	public static write(packet: Packet, offset: number, resist: Resist): void {
		packet
			.uint16(offset, resist.defense)
			.uint16(offset + 2, resist.hitRate)
			.uint16(offset + 4, resist.dodgeRate)
			.uint16(offset + 6, resist.drainResist)
			.uint16(offset + 8, resist.berserkRate)
			.uint16(offset + 10, resist.berserkDamage)
			.uint16(offset + 12, resist.criticalRate)
			.uint16(offset + 14, resist.criticalDamage)
			.uint16(offset + 16, resist.criticalResist)
			.uint16(offset + 18, resist.comboRate)
			.uint16(offset + 20, resist.comboHit)
			.uint16(offset + 22, resist.counterAttackRate)
			.uint16(offset + 24, resist.counterAttackDamage)
			.uint16(offset + 26, resist.pierce)
			.uint16(offset + 28, resist.pierceDamage)
			.uint16(offset + 30, resist.magicReflect)
			.uint16(offset + 32, resist.magicReflectDamage)
			.uint16(offset + 34, resist.meleeReflect)
			.uint16(offset + 36, resist.meleeReflectDamage)
			.uint16(offset + 38, resist.deathResist)
			.uint16(offset + 40, resist.evilResist)
			.uint16(offset + 42, resist.flashResist)
			.uint16(offset + 44, resist.iceResist)
			.uint16(offset + 46, resist.fireResist)
			.uint16(offset + 48, resist.meleeResist)
			.uint16(offset + 50, resist.poisonResist)
			.uint16(offset + 52, resist.chaosResist)
			.uint16(offset + 54, resist.stunResist)
			.uint16(offset + 56, resist.hypnotizeResist)
			.uint16(offset + 58, resist.frailtyResist);
	}
}
