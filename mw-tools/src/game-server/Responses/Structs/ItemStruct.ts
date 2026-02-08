import type { Item } from '../../GameState/Item/Item';
import { Packet } from '../../PacketBuilder';
import { PacketType } from '../../PacketType';

export abstract class ItemStruct {
	public static readonly size: number = 24;

	/**
	 * Write item data to the packet.
	 * @param packet
	 * @param offset
	 * @param slot
	 * @param item
	 */
	public static write(packet: Packet, offset: number, slot: number, item: Item | null): void {
		packet.uint32(offset, slot);

		if (item !== null) {
			packet
				.int32(offset + 4, 1) // id, not actually used?
				.uint8(offset + 8, item.count)
				.uint16(offset + 12, item.file)
				.uint8(offset + 20, item.locked ? 1 : 0);
		} else {
			// primarily used for bank handling
			packet
				.int32(offset + 4, 0)
				.uint8(offset + 8, 0)
				.uint16(offset + 12, 65535)
				.uint8(offset + 20, 0);
		}
	}

	/**
	 * Writes data of multiple items to the packet.
	 * @param packet
	 * @param offset
	 * @param items
	 */
	public static writeList(
		packet: Packet,
		offset: number,
		items: Iterable<[slot: number, item: Item | null]>,
	): void {
		for (let [slot, item] of items) {
			this.write(packet, offset, slot, item);
			offset += this.size;
		}
	}

	public static remove(index: number): Packet {
		return new Packet(16, PacketType.ItemRemove).uint32(12, index);
	}
}
