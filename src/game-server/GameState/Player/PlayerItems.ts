import type { BaseItem } from '../../Database/Collections/BaseItem/BaseItemTypes';
import { createClientContext } from '../../GameActions/GameActionContext';
import { Logger } from '../../Logger/Logger';
import { ItemEquipStatus, ItemPackets } from '../../Responses/ItemPackets';
import { MessagePackets } from '../../Responses/MessagePackets';
import { ItemContainer, ItemContainerJson } from '../Item/ItemContainer';
import { ItemType } from '../Item/ItemType';
import type { Player } from './Player';
import { Item } from '../Item/Item';
import { getPetTemplate, petTemplates } from '../../Data/PetTemplates';
import { AddPetExecutable } from '../../GameActions/Actions/AddPetExecutable';
import { AddItemExecutable } from '../../GameActions/Actions/AddItemExecutable';
import { NpcSayExecutable } from '../../GameActions/Actions/NpcSayExecutable';
import { NpcType } from '../../Database/Collections/Npc/NpcJson';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import { EquipmentSlot, EquipmentSlotNames } from '../../Enums/EquipmentSlot';
import { convertGemItemToDiamondItem } from '../../Utils/GemDiamondMap';

export type PlayerItemsJson = {
	gold: number;
	bankGold: number;
	inventory: ItemContainerJson[];
	bank: ItemContainerJson[];
	equipment: ItemContainerJson[];
};

/**
 * Manages the player's inventory, equipment, bank and gold.
 */
export class PlayerItems {
	private player: Player;

	constructor(player: Player) {
		this.player = player;
	}

	/**
	 * How much gold the player has in their inventory.
	 */
	public gold: number = 0;

	/**
	 * How much gold the player has deposited.
	 */
	public bankGold: number = 0;

	/**
	 * The inventory items.
	 */
	public inventory: ItemContainer = new ItemContainer(40);

	/**
	 * The bank items.
	 */
	public bank: ItemContainer = new ItemContainer(40);

	/**
	 * Equipped items.
	 */
	public equipment: ItemContainer = new ItemContainer(7);

	/**
	 * Returns the number of items the player has with the given id.
	 * Returns total count, not slots used.
	 * @param baseItemId
	 * @param includeBank
	 */
	public getItemCount(baseItemId: number, includeBank: boolean = false): number {
		let count = this.inventory.getItemCount(baseItemId);

		if (includeBank) count += this.bank.getItemCount(baseItemId);

		return count;
	}

	/**
	 * Add the given number of items to the inventory.
	 * @param baseItem
	 * @param count
	 */
	public addItemAndSend(baseItem: BaseItem, count: number): void {
		let changed = this.inventory.addItem(baseItem, count);
		this.player.client?.write(ItemPackets.change(changed));
	}

	/**
	 * Removes the item at the given slot.
	 * @param index
	 */
	public removeSlotAndSend(index: number): void {
		let item = this.inventory.get(index);

		if (item === null || item.locked || item.questItem) return;

		this.inventory.delete(index);
		this.player.client?.write(ItemPackets.remove(index));
	}

	/**
	 * Removes the first item(s) in the inventory matching this base item.
	 * @param baseItemId
	 * @param count
	 */
	public removeItemAndSend(baseItemId: number, count: number = 1): void {
		let changed = this.inventory.removeItem(baseItemId, count);
		this.player.client?.write(ItemPackets.change(changed));
	}

	/**
	 * Moves or restacks items, or switch them around.
	 * @param srcIndex
	 * @param dstIndex
	 */
	public moveItemAndSend(srcIndex: number, dstIndex: number): void {
		let changed = this.inventory.moveItem(srcIndex, dstIndex);
		this.player.client?.write(ItemPackets.change(changed));
	}

	/**
	 * Adds gold to the inventory.
	 * @param gold can be negative to remove gold.
	 */
	public addGoldAndSend(gold: number): void {
		this.gold += gold;
		this.player.client?.write(ItemPackets.gold(this));
	}

	/**
	 * Use the item at the given inventory slot.
	 * @param index
	 */
	public useItemAndSend(index: number): void {
		let item = this.inventory.get(index);

		if (!this.player.client || !item || item.count <= 0) return;

		this.player.memory.lastItemUsedIndex = index;

		switch (item.type) {
			case ItemType.None:
				return;
			case ItemType.Equipment:
				this.equipItemAndSend(index);
				return;
			case ItemType.Consumable:
				this.consumeItemAndSend(index);
				return;
			case ItemType.Usable:
				item.action?.execute(createClientContext(this.player.client));
				return;
			default:
				Logger.error('Item has unknown type', item);
				throw Error('Item has unknown type ' + item.type);
		}
	}

	/**
	 * Move an item from equipment to inventory. Does nothing when there is no space.
	 * @param index
	 */
	public unequipItemAndSend(index: number): void {
		let item = this.equipment.get(index);

		if (item === null) return;

		let dst = this.inventory.getFreeIndex();

		if (dst === null) return;

		this.inventory.set(dst, item);
		this.equipment.delete(index);

		// Update the player fight stats
		this.player.fightStats.update(this.player);

		this.player.client?.write(
			ItemPackets.change([[dst, item]]),
			ItemPackets.equip(ItemEquipStatus.Ok, index, null),
			PlayerPackets.resist(this.player),
		);
	}

	/**
	 * Equips an item. If an item is already equipped they will switch places.
	 * @param index
	 */
	private equipItemAndSend(index: number): void {
		let item = this.inventory.get(index);

		if (item === null || item.equipmentSlot === null) return;

		// Check level requirement
		if (item.level !== undefined) {
			const requiredLevel = item.level * 10 - 10;
			const playerLevel = this.player.level.level;
			if (playerLevel < requiredLevel) {
				this.player.client?.write(
					ItemPackets.equip(ItemEquipStatus.LowLvl, item.equipmentSlot, null),
				);
				return;
			}
		}

		// Check if player meets race and gender requirements
		if (item.race !== undefined && item.gender !== undefined) {
			if (item.race !== this.player.race || item.gender !== this.player.gender) {
				this.player.client?.write(
					ItemPackets.equip(ItemEquipStatus.WrongRace, item.equipmentSlot, null),
				);
				return;
			}
		}

		let dstIndex = item.equipmentSlot;
		let dstItem = this.equipment.get(dstIndex);
		this.equipment.set(dstIndex, item, true);

		if (dstItem) this.inventory.set(index, dstItem, true);
		else this.inventory.delete(index);

		// Update the player fight stats
		this.player.fightStats.update(this.player);

		this.player.client?.write(
			ItemPackets.change([[index, dstItem]]),
			ItemPackets.equip(ItemEquipStatus.Ok, dstIndex, item),
			PlayerPackets.resist(this.player),
		);
	}

	/**
	 * Use the item and reduce its count by one. Removes the item if none are left.
	 * @param index
	 */
	private consumeItemAndSend(index: number): void {
		let item = this.inventory.get(index);

		if (!this.player.client || !item) return;

		let allowed = item.action?.execute(createClientContext(this.player.client)) ?? false;

		if (!allowed) return;

		this.reduceItem(index);
	}

	/**
	 * Reduces the item count by one. Removes the item if none are left.
	 * @param index
	 */
	public reduceItem(index: number): void {
		let item = this.inventory.get(index);
		if (!item || item.locked || item.questItem) return;
		if (!this.player.client) return;

		--item.count;

		if (item.count <= 0) {
			this.inventory.delete(index);
			item = null;
			this.player.client?.write(ItemPackets.remove(index));
		} else {
			this.player.client.write(ItemPackets.change([[index, item]]));
		}
	}

	/**
	 * Handles giving items to other players or NPCs.
	 * For players: Transfers the specified items from this player's inventory to the target player.
	 * @param target The ID of the target
	 * @param indexes Array of inventory slot indexes to give
	 * @param counts Array of item counts corresponding to each index
	 */

	public giveItemToPlayerAndSend(
		targetPlayerId: number,
		indexes: number[],
		counts: number[],
	): void {
		const targetPlayer = this.player.mapData.map.players.get(targetPlayerId);
		if (!targetPlayer) {
			return;
		}

		for (let i = 0; i < indexes.length; i++) {
			const index = indexes[i];
			if (index > 40) break;
			const count = counts[i] || 1;
			let item = this.inventory.get(index);
			if (item === null || item.locked || item.questItem) continue;

			// Check if target player has space for the items
			if (!targetPlayer.items.inventory.hasSpaceFor(item.base, count)) {
				this.player.client?.write(
					MessagePackets.showSystem('Insufficient inventory space!'), //replace with chat message?
				);
				continue;
			}

			this.removeItemsFromInventory([index], [count]);

			const changed = targetPlayer.items.inventory.addItem(item, count);

			targetPlayer.client?.write(ItemPackets.change(changed));

			this.player.client?.write(
				ItemPackets.give(targetPlayerId, [index, null, null], [count, null, null], 0),
			);
			targetPlayer.client?.write(
				ItemPackets.give(this.player.id, [index, null, null], [count, null, null], 0),
			);

			// Add system messages for both players
			this.player.client?.write(
				MessagePackets.showSystem(`You gave ${targetPlayer.name} ${count} ${item.name}`),
			);
			targetPlayer.client?.write(
				MessagePackets.showSystem(`${this.player.name} gave you ${count} ${item.name}`),
			);

			Logger.info(
				`Player ${this.player.id} gave ${count} ${item.name} to player ${targetPlayerId}`,
			);
		}
	}
	public giveGoldAndSend(targetPlayerId: number, gold: number): void {
		const targetPlayer = this.player.mapData.map.players.get(targetPlayerId);
		if (!targetPlayer) {
			return;
		}

		// Check if player has enough gold
		if (this.gold < gold) {
			this.player.client?.write(
				MessagePackets.showMessage('Insufficient gold!'), //replace with chat message?
			);
			return;
		}

		// Remove gold from sender
		this.gold -= gold;
		this.player.client?.write(ItemPackets.gold(this));

		// Add gold to receiver
		targetPlayer.items.gold += gold;
		targetPlayer.client?.write(ItemPackets.gold(targetPlayer.items));

		Logger.info(`Player ${this.player.id} gave ${gold} gold to player ${targetPlayerId}`);
	}

	/**
	 * Handles giving items to NPCs
	 * @param targetNpcId The ID of the target NPC
	 * @param indexes Array of inventory slot indexes to give
	 * @param counts Array of item counts corresponding to each index
	 */
	public giveItemToNpcAndSend(targetNpcId: number, indexes: number[], counts: number[]): void {
		const targetNpc = this.player.mapData.map.npcs.find(npc => npc.id === targetNpcId);
		if (!targetNpc) {
			return;
		}

		const npcType = targetNpc.type;

		for (let i = 0; i < indexes.length; i++) {
			const index = indexes[i];
			if (index > 40) break;
			const count = counts[i] || 1;
			const item = this.inventory.get(index);
			if (item === null || item.locked || item.questItem) continue;

			// calls for hatching an egg and forging an item
			if (item.id > 60000 && item.id < 60400 && npcType === NpcType.Pet) {
				this.eggHatchAndSend([index], [count]);
				continue;
			}
			if (item.id > 400000 && item.id < 460000 && npcType === NpcType.Forge) {
				this.forgeItemAndSend(indexes, counts);
				continue;
			}
			if (item.id > 400000 && item.id < 460000 && npcType === NpcType.Gem) {
				this.gemApplyAndSend(indexes);
				continue;
			}
			if (item.id > 30000 && item.id < 40000 && npcType === NpcType.GemConverter) {
				this.gemConvertAndSend(index);
				continue;
			}
		}
	}

	/**
	 * Deposits an item into the bank
	 * @param index
	 * @param count
	 * @returns
	 */
	public depositItemAndSend(index: number, count: number): void {
		const item = this.inventory.get(index);
		if (!item || item.locked || item.questItem) {
			this.player.client?.write(MessagePackets.showSystem('Cannot deposit this item.'));
			return;
		}

		// Check if we have enough items to deposit
		if (item.count < count) {
			this.player.client?.write(
				MessagePackets.showSystem("You don't have enough items to deposit."),
			);
			return;
		}

		// Check if bank has space
		if (!this.bank.hasSpaceFor(item.base, count)) {
			this.player.client?.write(MessagePackets.showSystem('Your bank is full.'));
			return;
		}

		// Create a new item for the bank
		const bankItem = new Item(item.base);
		bankItem.count = count;
		bankItem.itemProperties = item.itemProperties;

		// Add to bank
		const bankChanges = this.bank.addItem(bankItem, count);

		// Remove from inventory
		item.count -= count;
		if (item.count <= 0) {
			this.inventory.delete(index);
			this.player.client?.write(ItemPackets.remove(index));
		} else {
			this.player.client?.write(ItemPackets.change([[index, item]]));
		}

		// Send bank changes to client
		if (bankChanges.length > 0) {
			this.player.client?.write(
				ItemPackets.change(
					bankChanges.map(([slot, item]) => [slot + this.inventory.maxSize, item]),
				),
			);
		}

		Logger.info(`Player ${this.player.id} deposited ${count} ${item.name} to bank`);
	}

	/**
	 * Withdraws an item from the bank
	 * @param index The index of the item in the bank
	 * @param count The number of items to withdraw
	 */
	public withdrawItemAndSend(index: number, count: number): void {
		const item = this.bank.get(index);
		if (!item || item.locked || item.questItem) {
			this.player.client?.write(MessagePackets.showSystem('Cannot withdraw this item.'));
			return;
		}

		// Check if we have enough items to withdraw
		if (item.count < count) {
			this.player.client?.write(
				MessagePackets.showSystem("You don't have enough items to withdraw."),
			);
			return;
		}

		// Check if inventory has space
		if (!this.inventory.hasSpaceFor(item.base, count)) {
			this.player.client?.write(MessagePackets.showSystem('Your inventory is full.'));
			return;
		}

		// Create a new item for the inventory
		const inventoryItem = new Item(item.base);
		inventoryItem.count = count;
		inventoryItem.itemProperties = item.itemProperties;

		// Add to inventory
		const inventoryChanges = this.inventory.addItem(inventoryItem, count);

		// Remove from bank
		item.count -= count;
		if (item.count <= 0) {
			this.bank.delete(index);
			this.player.client?.write(ItemPackets.change([[0x01000000 + index, item]]));
			this.player.client?.write(ItemPackets.bankItemList(this.bank));
		} else {
			this.player.client?.write(ItemPackets.change([[0x01000000 + index, item]]));
		}

		// Send inventory changes to client
		if (inventoryChanges.length > 0) {
			this.player.client?.write(ItemPackets.change(inventoryChanges));
		}

		Logger.info(`Player ${this.player.id} withdrew ${count} ${item.name} from bank`);
	}

	/**
	 * Deposits gold into the bank
	 * @param gold The amount of gold to deposit
	 */
	public depositGoldAndSend(gold: number): void {
		// Check if player has enough gold to deposit
		if (this.gold < gold) {
			this.player.client?.write(
				MessagePackets.showSystem("You don't have enough gold to deposit."),
			);
			return;
		}

		this.gold -= gold;
		this.bankGold += gold;
		this.player.client?.write(ItemPackets.gold(this));
	}

	/**
	 * Withdraws gold from the bank
	 * @param gold The amount of gold to withdraw
	 */
	public withdrawGoldAndSend(gold: number): void {
		if (this.bankGold < gold) {
			this.player.client?.write(
				MessagePackets.showSystem("You don't have enough gold to withdraw."),
			);
			return;
		}

		this.gold += gold;
		this.bankGold -= gold;
		this.player.client?.write(ItemPackets.gold(this));
	}

	/**
	 * Handles hatching eggs.
	 * @param indexes Array of inventory slot indexes to give
	 * @param counts Array of item counts corresponding to each index
	 */
	public eggHatchAndSend(indexes: number[], counts: number[]): void {
		const egg = this.inventory.get(indexes[0]);
		if (!egg?.petId || egg.count > 1) {
			Logger.warn('Invalid egg or insufficient quantity');
			return;
		}

		const petTemplate = getPetTemplate(egg.petId);
		const petPropertyTag = Object.keys(petTemplates).find(
			key => petTemplates[key as keyof typeof petTemplates].petId === egg.petId,
		);

		if (!petTemplate?.petId || !petPropertyTag) {
			Logger.info(`Invalid pet template or tag for petId: ${egg.petId}`);
			return;
		}

		this.removeItemsFromInventory([indexes[0]], [counts[0]]);

		if (this.player.client) {
			const context = createClientContext(this.player.client);
			AddPetExecutable.parse({ type: 'addPet', pet: petPropertyTag }).execute(context);
			NpcSayExecutable.parse({ type: 'npcSay', message: 'Your egg has hatched!' }).execute(
				context,
			);

			this.player.client.write(
				ItemPackets.change([[indexes[0], this.inventory.get(indexes[0])]]),
			);
		}

		Logger.info(
			`Player ${this.player.id} hatched an egg and received a pet with id ${egg.petId}`,
		);
	}

	/**
	 * Handles forging items.
	 * @param indexes Array of inventory slot indexes to give
	 * @param counts Array of item counts corresponding to each index
	 */
	public forgeItemAndSend(indexes: number[], counts: number[]): void {
		const equipmentIndex = indexes[0];
		const oreIndex = indexes[1];
		const equipmentCount = counts[0];
		const oreCount = counts[1];

		const currentEquipment = this.inventory.get(equipmentIndex);
		const currentOre = this.inventory.get(oreIndex);

		if (!currentEquipment || !currentOre) {
			return;
		}

		// Compare equipment and ore levels
		if (currentEquipment.level !== currentOre.level) {
			const context = createClientContext(this.player.client!);
			NpcSayExecutable.parse({
				type: 'npcSay',
				message: 'Place the equipment in the first slot and the ore in the second slot.',
			}).execute(context);
			return;
		} else {
			this.removeItemsFromInventory([equipmentIndex, oreIndex], [equipmentCount, oreCount]);
			if (this.player.client) {
				const context = createClientContext(this.player.client);
				AddItemExecutable.parse({
					type: 'addItem',
					baseItemId: currentEquipment.id + 1,
					amount: 1,
				}).execute(context);
				NpcSayExecutable.parse({ type: 'npcSay', message: 'You forged an item!' }).execute(
					context,
				);
				this.player.client.write(
					ItemPackets.change([
						[equipmentIndex, this.inventory.get(equipmentIndex)],
						[oreIndex, this.inventory.get(oreIndex)],
					]),
				);
			}
			Logger.info(`Player ${this.player.id} forged an item`);
		}
	}

	/**
	 * Adds gem to equipment
	 * @param indexes Array of inventory slot indexes, where the first is the equipment and the second is the gem
	 */
	public gemApplyAndSend(indexes: number[]): void {
		const equipmentIndex = indexes[0];
		const gemIndex = indexes[1];

		const equipment = this.inventory.get(equipmentIndex);
		const gem = this.inventory.get(gemIndex);

		if (!equipment || !gem) {
			this.player.client?.write(
				MessagePackets.showSystem('Please select both an equipment and a gem.'),
			);
			return;
		}

		// Get the equipment slot type
		const equipmentSlotType = equipment.equipmentSlot;
		if (equipmentSlotType === null) {
			this.player.client?.write(MessagePackets.showSystem('First item must be equipment.'));
			return;
		}

		// Convert equipment slot to type string for comparison
		let equipmentType: EquipmentSlot;
		switch (equipmentSlotType) {
			case 0:
				equipmentType = EquipmentSlot.Head;
				break;
			case 1:
				equipmentType = EquipmentSlot.Armour;
				break;
			case 2:
				equipmentType = EquipmentSlot.Weapon;
				break;
			case 3:
				equipmentType = EquipmentSlot.Shoes;
				break;
			case 4:
				equipmentType = EquipmentSlot.Necklace;
				break;
			default:
				this.player.client?.write(
					MessagePackets.showSystem('Gem cannot be applied to this piece of equipment.'),
				);
				return;
		}

		// Check if the gem is compatible with this equipment type
		const gemData = gem.base as unknown as { supportedEquipmentSlots?: EquipmentSlot[] };
		if (!gemData.supportedEquipmentSlots?.includes(equipmentType)) {
			this.player.client?.write(
				MessagePackets.showSystem(
					`This gem cannot be applied to ${EquipmentSlotNames[equipmentSlotType]}.`,
				),
			);
			return;
		}

		// Initialize item properties if they don't exist
		if (!equipment.itemProperties) {
			equipment.itemProperties = {};
		}

		// Initialize gem properties if they don't exist
		if (!equipment.itemProperties.gems) {
			equipment.itemProperties.gems = [];
		}

		// Check if all gem slots are full
		const maxGemSlots = 3; // Assuming max 3 gem slots per equipment
		const equippedGems = equipment.itemProperties.gems;
		if (equippedGems.length >= maxGemSlots) {
			this.player.client?.write(
				MessagePackets.showSystem('You cannot add any more gems to this item.'),
			);
			return;
		}

		equippedGems.push({
			id: gem.id,
			stats: gem.stats,
		});

		// Remove the gem from inventory
		this.reduceItem(gemIndex);

		// Send success message
		this.player.client?.write(
			MessagePackets.showSystem(`Successfully added ${gem.name} to ${equipment.name}`),
		);

		// Update the equipment in the inventory
		this.player.client?.write(ItemPackets.change([[equipmentIndex, equipment]]));

		// Update the players fight stats
		this.player.fightStats.update(this.player);
	}

	/**
	 * Converts gems to diamonds
	 * @param indexes Array of inventory slot indexes
	 */
	private gemConvertAndSend(index: number): void {
		// Skip invalid indexes
		if (index > this.inventory.maxSize) return;

		let gem = this.inventory.get(index);
		if (!gem) return;

		let diamond = convertGemItemToDiamondItem(gem, this.player.game.baseItems);
		if (!diamond) return;

		this.addItemAndSend(diamond, 1);

		this.reduceItem(index);

		// Send success message
		this.player.client?.write(
			MessagePackets.showSystem(`Successfully converted ${gem.name} to ${diamond.name}`),
		);
	}

	/**
	 * Removes items from the inventory.
	 * @param indexes Array of inventory slot indexes to remove
	 * @param counts Array of item counts corresponding to each index
	 */
	private removeItemsFromInventory(indexes: number[], counts: number[]): void {
		const changes: [number, Item | null][] = [];

		for (let i = 0; i < indexes.length; i++) {
			const index = indexes[i];
			const count = counts[i];
			let item = this.inventory.get(index);
			if (!item) continue;

			item.count -= count;
			if (item.count <= 0) {
				this.inventory.delete(index);
				this.player.client?.write(ItemPackets.remove(index));
			} else {
				changes.push([index, item]);
			}
		}

		if (changes.length > 0) {
			this.player.client?.write(ItemPackets.change(changes));
		}
	}

	/**
	 * Converts the player items to JSON format.
	 * @returns PlayerItemsJson
	 */
	public toJson(): PlayerItemsJson {
		return {
			gold: this.gold,
			bankGold: this.bankGold,
			inventory: this.inventory.toJson(),
			bank: this.bank.toJson(),
			equipment: this.equipment.toJson(),
		};
	}

	/**
	 * Creates a PlayerItems instance from JSON data.
	 * @param json The JSON data to create the PlayerItems from
	 * @param player The player instance to associate with the PlayerItems
	 */
	public static fromJson(json: PlayerItemsJson, player: Player): PlayerItems {
		const playerItems = new PlayerItems(player);
		playerItems.gold = json.gold;
		playerItems.bankGold = json.bankGold;

		playerItems.inventory = ItemContainer.fromJson(
			json.inventory,
			40,
			playerItems.player.game.baseItems,
		);
		playerItems.bank = ItemContainer.fromJson(json.bank, 40, playerItems.player.game.baseItems);
		playerItems.equipment = ItemContainer.fromJson(
			json.equipment,
			7,
			playerItems.player.game.baseItems,
		);

		return playerItems;
	}
}
