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
		let packet2 = new Packet(16 + items.length * 20, PacketType.ShopItemList).uint32(
			12,
			items.length,
		);

		let offset = 16;
		for (let item of items) {
			packet2
				.int32(offset, 1) // id, not actually used?
				.uint8(offset + 4, 0) // count? also not used?
				.uint16(offset + 8, item.file)
				.uint16(offset + 12, item.price);
			offset += 20;
		}

		return [packet1, packet2];
	}
}
