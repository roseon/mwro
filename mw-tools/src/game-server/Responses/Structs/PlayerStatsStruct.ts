import type { Player } from '../../GameState/Player/Player';
import type { Packet } from '../../PacketBuilder';

export abstract class PlayerStatsStruct {
	public static readonly size: number = 68;

	/**
	 * Writes the player stats to the packet.
	 * @param packet
	 * @param offset
	 * @param player
	 */
	public static write(packet: Packet, offset: number, player: Player): void {
		let stats = player.fightData.stats;
		packet
			.uint32(offset, player.fightData.stats.unused)
			// 4 sta base
			.uint32(offset + 8, stats.hp.points)
			// 12 sta growth
			.uint32(offset + 12, Math.floor((stats.hp.growthRate || 0) * 1000))

			// 16 int base
			.uint32(offset + 16, stats.mp.points)
			// 20 int rate
			.uint32(offset + 20, stats.mp.points)
			// 24 int growth
			.uint32(offset + 24, Math.floor((stats.mp.growthRate || 0) * 1000))

			// 28 str base
			.uint32(offset + 32, stats.attack.points)
			// 36 str growth
			.uint32(offset + 36, Math.floor((stats.attack.growthRate || 0) * 1000))

			// 40 agi base
			.uint32(offset + 40, stats.speed.points)
			// 44 agi rate
			.uint32(offset + 44, stats.speed.points)
			// 48 agi growth
			.uint32(offset + 48, Math.floor((stats.speed.growthRate || 0) * 1000))

			.uint32(offset + 52, player.file);
		// 56 reborn stats?
		// 60 reborn count?
		// 64 ?
	}
}
