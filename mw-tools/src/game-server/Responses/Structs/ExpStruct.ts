import type { Level } from '../../GameState/Level';
import type { Packet } from '../../PacketBuilder';

export abstract class ExpStruct {
	public static readonly size: number = 12;

	/**
	 * Write exp data to the packet.
	 * @param packet
	 * @param offset
	 * @param level
	 */
	public static write(packet: Packet, offset: number, level: Level): void {
		packet
			.uint32(offset, level.totalExp)
			.uint32(offset + 4, level.currentLvlExp)
			.uint32(offset + 8, level.neededExp);
	}
}
