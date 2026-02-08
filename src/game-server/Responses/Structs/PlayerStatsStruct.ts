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
			// 16 int base
			.uint32(offset + 20, stats.mp.points)
			// 24 int growth
			// 28 str base
			.uint32(offset + 32, stats.attack.points)
			// 36 str growth
			// 40 agi base
			.uint32(offset + 44, stats.speed.points)
			// 48 agi growth
			.uint32(offset + 52, player.file);
		// 56 reborn stats?
		// 60 reborn count?
		// 64 ?
	}
}
