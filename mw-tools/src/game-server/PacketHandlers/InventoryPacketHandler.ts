import { ItemListType } from '../Enums/ItemListType';
import type { Item } from '../GameState/Item/Item';
import type { Pet } from '../GameState/Pet/Pet';
import { Logger } from '../Logger/Logger';
import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import { ItemPackets } from '../Responses/ItemPackets';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles packets regarding the inventory.
 */
export class InventoryPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return (
			(type >= 0x00070000 && type < 0x00080000) ||
			type === PacketType.DepositItem ||
			type === PacketType.BankItemList ||
			type === PacketType.WithdrawItem ||
			type === PacketType.DepositGold ||
			type === PacketType.WithdrawGold
		);
	}

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public handlePacket(packet: Buffer, client: PacketConnection): void {
		if (!this.hasPlayer(client)) return;

		let type = getPacketType(packet);

		switch (type) {
			case PacketType.InventoryData:
				client.write(
					ItemPackets.inventory(client.player.items.inventory),
					ItemPackets.equipment(client.player.items.equipment),
				);
				break;
			case PacketType.ItemRemove:
				this.onItemRemove(packet, client);
				break;
			case PacketType.ItemChange:
				this.onItemChange(packet, client);
				break;
			case PacketType.ItemUse:
				this.onItemUse(packet, client);
				break;
			case PacketType.GoldData:
				client.write(ItemPackets.gold(client.player.items));
				break;
			case PacketType.ItemUnequip:
				this.onItemUnequip(packet, client);
				break;
			case PacketType.ItemInfo:
				this.onItemInfo(packet, client);
				break;
			case PacketType.ItemGive:
				this.onItemGive(packet, client);
				break;
			case PacketType.DepositItem:
				this.onDepositItem(packet, client);
				break;
			case PacketType.BankItemList:
				this.onBankItemList(packet, client);
				break;
			case PacketType.WithdrawItem:
				this.onWithdrawItem(packet, client);
				break;
			case PacketType.DepositGold:
				this.onDepositGold(packet, client);
				break;
			case PacketType.WithdrawGold:
				this.onWithdrawGold(packet, client);
				break;

			default:
				this.notImplemented(packet);
		}
	}

	private onItemGive(packet: Buffer, client: PlayerConnection): void {
		Logger.info('ItemGive packet contents:');
		for (let i = 0; i < packet.length; i++) {
			Logger.info(`Byte ${i}: ${packet[i]} (0x${packet[i].toString(16).padStart(2, '0')})`);
		}

		const indexes = [16, 20, 24].map(offset => packet.readUInt16LE(offset));
		const counts = [28, 32, 36].map(offset => packet.readUInt16LE(offset));
		const isNpc = packet.readUInt8(15);
		const target = packet.readUInt32LE(12);
		const npcId = client.game.npcs.get(target);
		const gold = packet.readUInt32LE(40);

		if ((isNpc === 128 || isNpc === 136) && !npcId) {
			Logger.warn(`ItemGive: NPC target not found. isNpc: ${isNpc}, npcId: ${npcId}`);
			return;
		}

		if (isNpc !== 128 && isNpc !== 136) {
			Logger.info('Giving item to player');
			client.player.items.giveItemToPlayerAndSend(target, indexes, counts);
		} else {
			Logger.info('Giving item to NPC');
			client.player.items.giveItemToNpcAndSend(target, indexes, counts);
		}

		if (gold > 0) {
			client.player.items.giveGoldAndSend(target, gold);
		}
	}

	/**
	 * Client drops an item.
	 * @param packet
	 * @param client
	 */
	private onItemRemove(packet: Buffer, client: PlayerConnection): void {
		let index = packet.readUInt16LE(12);
		client.player.items.removeSlotAndSend(index);
	}

	/**
	 * Client moves an item.
	 * @param packet
	 * @param client
	 */
	private onItemChange(packet: Buffer, client: PlayerConnection): void {
		let srcIndex = packet.readUInt16LE(14);
		let dstIndex = packet.readUInt16LE(12);
		client.player.items.moveItemAndSend(srcIndex, dstIndex);
	}

	/**
	 * Client uses an item.
	 * @param packet
	 * @param client
	 */
	private onItemUse(packet: Buffer, client: PlayerConnection): void {
		let index = packet.readUInt16LE(12);
		client.player.items.useItemAndSend(index);
	}

	/**
	 * Client unequips an item.
	 * @param packet
	 * @param client
	 */
	private onItemUnequip(packet: Buffer, client: PlayerConnection): void {
		let index = packet.readUInt16LE(12);
		client.player.items.unequipItemAndSend(index);
	}

	/**
	 * Client requests the info for an item.
	 * @param packet
	 * @param client
	 */
	private onItemInfo(packet: Buffer, client: PlayerConnection): void {
        Logger.info(`[DEBUG] ItemInfo Raw Packet: ${packet.toString('hex')}`);

		let index = packet.readUInt16LE(12);
		let type: ItemListType = packet.readUInt16LE(14);
        let use32BitIndex = false;
        let realIndex = index; // Store the possibly 32-bit index

        // Check if type is at offset 16 (indicating 32-bit index)
        // Only check if initial type read is 0 (which could be high bits of 32-bit index)
        // AND packet is long enough to contain the type at offset 16
        // OR checks if offset 16 contains NpcShop (4) even if type at 14 wasn't 0 (for large IDs)
        if (packet.length >= 18) {
             const possibleType = packet.readUInt16LE(16);
             if (possibleType === ItemListType.NpcShop) {
                 // It is definitely an NpcShop request which uses 32-bit IDs
                 type = possibleType;
                 use32BitIndex = true;
                 realIndex = packet.readUInt32LE(12); // Read full 32-bit ID
                 
                 // CRITICAL FIX: If realIndex ID is small (e.g. 1), the first 2 bytes (index) were 1, and type was 0.
                 // This is handled by reading the full 32 bytes which includes the 0s.
                 // 01 00 00 00 = 1.
             }
        }

        Logger.info(`[DEBUG] ItemInfo Request: Index=${realIndex}, Type=${type}, 32bit=${use32BitIndex}`);

		let vendorItem =
			type === ItemListType.PlayerShop
				? (client.player.memory.vendorItems?.[realIndex] ?? null)
				: null;
		if (vendorItem?.type === 'pet') return;

		let item: Item | null = null;
		let pet: Pet | null = null;

		switch (type) {
			case ItemListType.Inventory:
				item = client.player.items.inventory.get(realIndex);
				break;
			case ItemListType.Equipment:
				item = client.player.items.equipment.get(realIndex);
				break;
			case ItemListType.NpcShop:
				item = client.player.memory.npcItems?.[realIndex] ?? null;
				if (!item && client.player.memory.npcItems) {
					item =
						client.player.memory.npcItems.find(
							shopItem => shopItem.file === realIndex || shopItem.id === realIndex,
						) ?? null;
				}
				break;
			case ItemListType.PlayerShop:
				if (vendorItem?.type === 'item') {
					const vendorPlayer = client.game.players.get(vendorItem.slotID);
					item = vendorPlayer?.items.inventory.get(vendorItem.slotID) ?? null;
				}
				break;
			case ItemListType.TradeItems:
				item = client.player.memory.itemsOffered?.[index] as Item | null;
				break;
			case ItemListType.TradePets:
				pet = client.player.memory.itemsOffered?.[index] as Pet | null;
				break;
			default:
				Logger.info('ItemInfo: Not implemented itemlist', type);
				break;
		}

		if (type === ItemListType.TradeItems) {
			if (item) {
				client.write(ItemPackets.tradeInfo(item));
			}
		}

		if (type === ItemListType.TradePets) {
			if (pet) {
				client.write(ItemPackets.info(pet));
			}
		} else {
			if (item) {
				client.write(ItemPackets.info(item));
			}
		}
    }

	private onDepositItem(packet: Buffer, client: PlayerConnection): void {
		let count = packet.readUInt16LE(12);
		let index = packet.readUInt16LE(14);

		// Validate the count is positive
		if (count <= 0) {
			Logger.warn(`Player ${client.player.id} attempted to deposit invalid count: ${count}`);
			return;
		}

		// Validate the index is within bounds
		if (index >= client.player.items.inventory.maxSize) {
			Logger.warn(
				`Player ${client.player.id} attempted to deposit from invalid index: ${index}`,
			);
			return;
		}

		// Attempt to deposit the item
		client.player.items.depositItemAndSend(index, count);
	}

	/**
	 * Client requests the bank item list.
	 * @param packet
	 * @param client
	 */
	private onBankItemList(packet: Buffer, client: PlayerConnection): void {
		//Triggered by opening the bank macro but only the first time??
		client.write(ItemPackets.bankItemList(client.player.items.bank));
	}

	/**
	 * Client withdraws an item from the bank.
	 * @param packet
	 * @param client
	 */
	private onWithdrawItem(packet: Buffer, client: PlayerConnection): void {
		let count = packet.readUInt16LE(12);
		let index = packet.readUInt16LE(14);
		client.player.items.withdrawItemAndSend(index, count);
	}

	/**
	 * Client deposits gold into the bank.
	 * @param packet
	 * @param client
	 */
	private onDepositGold(packet: Buffer, client: PlayerConnection): void {
		let gold = packet.readUInt32LE(12);
		client.player.items.depositGoldAndSend(gold);
	}

	/**
	 * Client withdraws gold from the bank.
	 * @param packet
	 * @param client
	 */
	private onWithdrawGold(packet: Buffer, client: PlayerConnection): void {
		let gold = packet.readUInt32LE(12);
		client.player.items.withdrawGoldAndSend(gold);
	}
}
