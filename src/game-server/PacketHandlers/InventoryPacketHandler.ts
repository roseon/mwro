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
		let index = packet.readUInt16LE(12);
		let type: ItemListType = packet.readUInt16LE(14);

		let vendorItem =
			type === ItemListType.PlayerShop
				? (client.player.memory.vendorItems?.[index] ?? null)
				: null;
		if (vendorItem?.type === 'pet') return;

		let item: Item | null = null;
		let pet: Pet | null = null;

		switch (type) {
			case ItemListType.Inventory:
				item = client.player.items.inventory.get(index);
				break;
			case ItemListType.Equipment:
				item = client.player.items.equipment.get(index);
				break;
			case ItemListType.NpcShop:
				item = client.player.memory.npcItems?.[index] ?? null;
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
			if (!pet) {
				return;
			}
			client.write(ItemPackets.info(pet));
		} else {
			if (!item) return;
			client.write(ItemPackets.info(item));
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
