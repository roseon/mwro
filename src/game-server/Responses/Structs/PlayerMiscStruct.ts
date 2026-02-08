import type { Player } from '../../GameState/Player/Player';
import type { Packet } from '../../PacketBuilder';

export abstract class PlayerMiscStruct {
	public static readonly size: number = 24;

	/**
	 * Writes the player misc stats to the packet.
	 * @param packet
	 * @param offset
	 * @param player
	 */
	public static write(packet: Packet, offset: number, player: Player): void {
		packet
			.uint32(offset, player.misc.reputation)
			.uint32(offset + 4, player.misc.deaths)
			.uint32(offset + 8, player.misc.pkPoints)
			.uint32(offset + 12, player.misc.pkKills)
			.uint32(offset + 16, player.misc.warExp);
		// 20 ? guild related
	}
}
