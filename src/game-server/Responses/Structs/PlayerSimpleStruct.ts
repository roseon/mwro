import type { Player } from '../../GameState/Player/Player';
import type { Packet } from '../../PacketBuilder';

/**
 * Basic character info.
 */
export abstract class PlayerSimpleStruct {
	public static readonly size: number = 28;

	/**
	 * Writes the basic character info to the packet.
	 * @param packet
	 * @param offset
	 * @param player
	 */
	public static write(packet: Packet, offset: number, player: Player): void {
		packet
			.uint32(offset, player.id)
			.string(offset + 4, player.name, 14)
			.uint8(offset + 19, player.race)
			.uint8(offset + 20, player.gender)
			.uint8(offset + 22, player.level.reborn)
			.uint16(offset + 24, player.level.level);
	}
}
