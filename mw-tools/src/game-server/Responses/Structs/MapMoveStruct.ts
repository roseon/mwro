import type { Npc } from '../../GameState/Npc/Npc';
import type { Player } from '../../GameState/Player/Player';
import type { Packet } from '../../PacketBuilder';

export abstract class MapMoveStruct {
	public static readonly size: number = 12;

	/**
	 * Write character id and coordinates to the packet.
	 * @param packet
	 * @param offset
	 * @param ind
	 */
	public static write(packet: Packet, offset: number, ind: Player | Npc): void {
		packet
			.uint32(offset, ind.id)
			.uint16(offset + 4, ind.mapData.dest.x)
			.uint16(offset + 6, ind.mapData.dest.y)
			// 8 0 = walk 1 = run ?
			.uint8(offset + 9, ind.mapData.direction);
	}
}
