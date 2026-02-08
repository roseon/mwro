import type { EquipmentSlot } from '../Enums/EquipmentSlot';
import type { Item } from '../GameState/Item/Item';
import type { ItemContainer } from '../GameState/Item/ItemContainer';
import type { Pet } from '../GameState/Pet/Pet';
import type { PlayerItems } from '../GameState/Player/PlayerItems';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import { MessagePackets } from './MessagePackets';
import { ItemStruct } from './Structs/ItemStruct';

export const enum ItemEquipStatus {
	Ok = 1,
	LowInt = -1,
	LowStr = -2,
	LowAgi = -3,
	LowSta = -4,
	LowLvl = -5,
	WrongRace = -6,
}

export abstract class ItemPackets {
	/**
	 * Send the player's inventory to the client.
	 * @param inventory
	 */
	public static inventory(inventory: ItemContainer): Packet {
		let packet = new Packet(
			16 + inventory.usedSize * ItemStruct.size,
			PacketType.InventoryData,
		).uint8(12, inventory.usedSize);

		ItemStruct.writeList(packet, 16, inventory.entries());
		return packet;
	}

	// TODO is this used?
	// public static add(): Buffer{}

	/**
	 * Remove an item from the client inventory.
	 * @param index slot number
	 */
	public static remove(index: number): Packet {
		return new Packet(16, PacketType.ItemRemove).uint32(12, index);
	}

	/**
	 * Update specific slots in the client's inventory.
	 * Null empties the slot.
	 * TODO: slot >= 0x01000000 targets different client memory area, maybe shop or bank?
	 *
	 */
	public static change(items: [slot: number, item: Item | null][]): Packet {
		let packet = new Packet(16 + items.length * ItemStruct.size, PacketType.ItemChange).uint8(
			12,
			items.length,
		);

		ItemStruct.writeList(packet, 16, items);
		return packet;
	}

	public static bankItemList(bank: ItemContainer): Packet {
		const bankSize = 24;
		let packet = new Packet(16 + bankSize * ItemStruct.size, PacketType.BankItemList).uint8(
			12,
			bankSize,
		);

		// Write all 24 bank slots, even if empty
		for (let slot = 0; slot < bankSize; slot++) {
			const item = bank.get(slot);
			ItemStruct.write(packet, 16 + slot * ItemStruct.size, slot, item);
		}

		return packet;
	}

	/**
	 * Update the client's gold (both inventory and bank).
	 * @param playerItems
	 */
	public static gold(playerItems: PlayerItems): Packet {
		return new Packet(24, PacketType.GoldData)
			.uint32(16, playerItems.gold)
			.uint32(20, playerItems.bankGold);
	}

	/**
	 * Remove an item from the client inventory.
	 * @param items item id
	 *
	 */
	public static give(
		npcId: number,
		itemIndexes: [number, number | null, number | null],
		itemCounts: [number, number | null, number | null],
		npcStatus: number,
	): Packet {
		const packet = new Packet(32, PacketType.ItemGive)
			.uint32(12, npcId)
			.uint16(15, npcStatus)
			.uint16(16, itemIndexes[0])
			.uint16(28, itemCounts[0]);

		if (itemIndexes[1] !== null && itemCounts[1] !== null) {
			packet.uint16(20, itemIndexes[1]).uint16(32, itemCounts[1]);
		}

		if (itemIndexes[2] !== null && itemCounts[2] !== null) {
			packet.uint16(24, itemIndexes[2]).uint16(36, itemCounts[2]);
		}

		return packet;
	}

	/**
	 * Update a single equipment slot.
	 * @param status
	 * @param slot
	 * @param item
	 */
	public static equip(status: ItemEquipStatus, slot: EquipmentSlot, item: Item | null): Packet {
		return new Packet(16 + ItemStruct.size, PacketType.ItemEquip)
			.int32(12, status)
			.struct(16, ItemStruct, slot, item);
	}

	/**
	 * Update all equipment slots.
	 * @param equipment
	 */
	public static equipment(equipment: ItemContainer): Packet {
		let packet = new Packet(
			16 + equipment.usedSize * ItemStruct.size,
			PacketType.EquipmentList,
		).uint8(12, equipment.usedSize);

		ItemStruct.writeList(packet, 16, equipment.entries());
		return packet;
	}

	/**
	 * Send the text of an item description.
	 * @param item
	 */
	public static info(item: Item | Pet): Packet {
		let text = item.getText();
		return new Packet(16 + text.length + 1, PacketType.ItemInfo).string(16, text);
	}

	public static infoShop(item: Item | Pet, index: number, type: number, use32BitIndex: boolean = false): Packet {
		let text = item.getText();
        if (use32BitIndex) {
            return new Packet(20 + text.length + 1, PacketType.ItemInfo)
                .uint32(12, index)
                .uint16(16, type)
                .string(18, text); // Text starts after index(4) + type(2) = 18? No. 12+4=16. 16+2=18.
        } else {
            return new Packet(16 + text.length + 1, PacketType.ItemInfo)
                .uint16(12, index)
                .uint16(14, type)
                .string(16, text);
        }
	}

	public static tradeInfo(item: Item): Packet {
		let text1 = `#m#gItem Being Offered;`;
		let text2 = item.getText();
		let text3 = `#m`;
		let text = text1 + text2 + text3;
		return MessagePackets.showSystem(text);
	}
}
