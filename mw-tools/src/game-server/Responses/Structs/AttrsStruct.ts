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
		const totals = ind.fightStats?.totals;
		const maxHp = totals?.hp ?? stats.hp.stat;
		const maxMp = totals?.mp ?? stats.mp.stat;
		const attack = totals?.attack ?? stats.attack.stat;
		const speed = totals?.speed ?? stats.speed.stat;
		packet
			.uint32(offset, ind.level.level)
			.uint32(offset + 4, maxHp)
			.uint32(offset + 8, stats.currentHp)
			.uint32(offset + 12, maxMp)
			.uint32(offset + 16, stats.currentMp)
			.uint32(offset + 20, attack)
			.uint32(offset + 24, speed);
	}
}
