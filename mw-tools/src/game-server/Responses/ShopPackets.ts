import { Macro } from '../Enums/Macro';
import type { Item } from '../GameState/Item/Item';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';

export abstract class ShopPackets {
	/**
	 * Opens an npc shop.
	 * @param items
	 */
	public static npcVendor(items: Item[]): Packet[] {
		let packet1 = new Packet(16, PacketType.SendMacro).uint8(12, Macro.ViewShop);
		const itemSize = 20;
		let packet2 = new Packet(16 + items.length * itemSize, PacketType.ShopItemList).uint32(
			12,
			items.length,
		);

		let offset = 16;
		let index = 0;
		for (let item of items) {
			packet2
				.int32(offset, index++)
				.uint8(offset + 4, Math.max(1, item.count))
				.uint16(offset + 8, item.file)
				.uint32(offset + 12, item.price);
			offset += itemSize;
		}

		return [packet1, packet2];
	}
}
