import type { Npc } from '../../GameState/Npc/Npc';
import { Player } from '../../GameState/Player/Player';
import type { Packet } from '../../PacketBuilder';
import { getTitleById } from '../../Updater/Data/TitleData';

export abstract class MapCharacterStruct {
	public static readonly size: number = 84;

	/**
	 * Write map character data to the packet.
	 * @param packet
	 * @param offset
	 * @param ind
	 */
	public static write(packet: Packet, offset: number, ind: Player | Npc): void {
		let file = ind.file;
		if (ind instanceof Player) {
			if (ind.memory.shapeshiftState.file) {
				file = ind.memory.shapeshiftState.file;
			}
		}

		packet
			.uint32(offset, ind.id)
			.string(offset + 4, ind.name, 14)
			.uint32(offset + 52, file)
			.uint16(offset + 58, ind.mapData.point.x)
			.uint16(offset + 60, ind.mapData.point.y)
			.uint16(offset + 62, ind.mapData.dest.x)
			.uint16(offset + 64, ind.mapData.dest.y)
			// 66 0 = walk 1 = run ?
			// 67 movement type?
			.uint8(offset + 68, ind.mapData.direction)
			.uint8(offset + 69, ind.mapData.canWalk ? 1 : 0) // TODO 2 or other options?
			.int32(offset + 80, -1); // Puts icon in front of body, what for?

		if (ind instanceof Player) {
			if (ind.titles.title) {
				const activeTitle = getTitleById(ind.titles.title);
				if (activeTitle) packet.string(offset + 25, activeTitle.name, 20);
			}

			packet
				.uint8(offset + 56, ind.class)
				.uint16(offset + 72, ind.effect.value)
				.uint16(offset + 76, ind.level.reborn);
		}
	}
}
