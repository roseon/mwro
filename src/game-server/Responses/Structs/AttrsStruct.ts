import type { Pet } from '../../GameState/Pet/Pet';
import type { Player } from '../../GameState/Player/Player';
import type { Packet } from '../../PacketBuilder';

export abstract class AttrsStruct {
	public static readonly size: number = 28;

	/**
	 * Writes player or pet attributes (level, hp, speed, etc.) to the packet.
	 * @param packet
	 * @param offset
	 * @param ind
	 */
	public static write(packet: Packet, offset: number, ind: Player | Pet): void {
		let stats = ind.fightData.stats;
		packet
			.uint32(offset, ind.level.level)
			.uint32(offset + 4, stats.hp.stat)
			.uint32(offset + 8, stats.currentHp)
			.uint32(offset + 12, stats.mp.stat)
			.uint32(offset + 16, stats.currentMp)
			.uint32(offset + 20, stats.attack.stat)
			.uint32(offset + 24, stats.speed.stat);
	}
}
