import { ItemListType } from '../Enums/ItemListType';
import { Packet } from '../PacketBuilder';
import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';
import { ItemPackets } from '../Responses/ItemPackets';
import { PlayerEffect } from '../Enums/PlayerEffect';
import type { Item } from '../GameState/Item/Item';
import { MessagePackets } from '../Responses/MessagePackets';
import { PlayerVendor } from '../GameState/Player/PlayerVendor';
import { PetPackets } from '../Responses/PetPackets';

export class VendorPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return (
			type === PacketType.VendorMenu ||
			type === PacketType.VendorOpen ||
			type === PacketType.VendorView ||
			type === PacketType.VendorInspectItem ||
			type === PacketType.VendorPurchaseItem ||
			type === PacketType.VendorClose
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
			// Open player shop
			case PacketType.VendorMenu:
				this.VendorMenu(packet, client);
				break;

			// Open player shop
			case PacketType.VendorOpen:
				this.PlayerVendorOpen(packet, client);
				break;

			// View vendor
			case PacketType.VendorView:
				this.PlayerVendorView(packet, client);
				break;

			// Buy item from vendor
			case PacketType.VendorPurchaseItem:
				this.VendorPurchaseItem(packet, client);
				break;

			// View vendor item
			case PacketType.VendorInspectItem:
				this.VendorInspectItem(packet, client);
				break;

			// Close vendor
			case PacketType.VendorClose:
				this.VendorClose(packet, client);
				break;

			default:
				this.notImplemented(packet);
		}
	}

	private VendorMenu(packet: Buffer, client: PlayerConnection): void {
		const response = new Packet(16, PacketType.VendorMenu);

		response.uint32(12, 0); // Replace later with map flag for whether vendor is allowed or not
		client.write(response);
	}

	private PlayerVendorOpen(packet: Buffer, client: PlayerConnection): void {
		//Set the shop effect
		client.player.effect.add(PlayerEffect.Shop);

		//Get vendor details
		const vendorName = packet.toString('utf8', 16, 31).replace(/\0+$/, '');
		const itemCount = packet.readUInt32LE(12);
		const vendorItems: PlayerVendor[] = [];

		let offset = 31;
		for (let i = 0; i < itemCount; i++) {
			const entryType = packet.readUInt32BE(offset + 4);
			const itemPrice = packet.readUInt32LE(offset + 8);

			if (entryType === 193151488) {
				// TODO Change to more logical check
				const itemIndex = packet.readUInt8(offset);
				vendorItems.push(new PlayerVendor('item', itemIndex, itemPrice));
			} else if (entryType === 209928704) {
				// TODO Change to more logical check
				const itemIndex = packet.readUInt32LE(offset);
				vendorItems.push(new PlayerVendor('pet', itemIndex, itemPrice));
			}
			offset += 12;
		}

		// Store the vendor items in the player's memory
		client.player.memory.vendorItems = vendorItems;
		client.player.memory.vendorName = vendorName;

		const response = new Packet(16, PacketType.VendorOpen);
		response.uint16(12, client.player.id);
		client.write(response);
		client.player.sendVendorOpenToMap(vendorName);
	}

	private PlayerVendorView(packet: Buffer, client: PlayerConnection): void {
		//Get vendor
		const vendorPlayerId = packet.readUInt16LE(12);
		const vendorPlayer = client.game.players.get(vendorPlayerId);

		if (!vendorPlayer) {
			client.write(MessagePackets.showSystem('Vendor not found!'));
			return;
		}

		// Closing Vendor is janky, prevent vendor being opened
		if (!vendorPlayer.effect.has(PlayerEffect.Shop)) {
			client.write(MessagePackets.showSystem('Vendor closed!'));
			return;
		}

		// Get vendor's items
		const vendorItems = vendorPlayer.memory.vendorItems || [];

		// Create response packet
		const response = new Packet(16 + vendorItems.length * 16 + 6, PacketType.VendorView);

		response.uint32(12, vendorPlayerId).uint8(16, vendorItems.length);

		// Item Entries
		let offset = 20;
		vendorItems.forEach((vendorItem, index) => {
			let fileId = 0;
			let count = 0;

			if (vendorItem.type === 'item') {
				// Get the actual item from the vendor's inventory using slotID
				const item = vendorPlayer.items.inventory.get(vendorItem.slotID);
				if (item) {
					fileId = item.file;
					count = item.count;
				}
			} else if (vendorItem.type === 'pet') {
				// Get the pet from the vendor's pets array using slotID
				fileId = vendorPlayer.findPetById(vendorItem.slotID)?.file ?? 0;
				count = 1;
			}

			response.uint8(offset, index);

			if (vendorItem.type === 'pet') {
				response.uint32(offset + 4, fileId + 10000); // pet file id + 10000
			} else {
				response.uint32(offset + 4, fileId); // item file id
			}

			response
				.uint32(offset + 8, vendorItem.price) // price
				.uint16(offset + 12, count); // quantity
			offset += 16;
		});

		// Store the items in the viewing player's memory
		client.player.memory.vendorItems = vendorItems;
		client.write(response);
	}

	private VendorInspectItem(packet: Buffer, client: PlayerConnection): void {
		let index = packet.readUInt16LE(16);
		//let type = packet.readUInt8(18); //mw2 using "0B" for items and "0C" for pets, replies with 070018 for pets, 07000D for items

		let vendorItem: PlayerVendor | null = client.player.memory.vendorItems?.[index] ?? null;
		if (!vendorItem) return;

		const vendorPlayerId = packet.readUInt16LE(12);
		const vendorPlayer = client.game.players.get(vendorPlayerId);

		if (!vendorPlayer) {
			client.write(MessagePackets.showMessage('Vendor not found!'));
			return;
		}

		let actualItem: Item | null = null;

		//VendorInspectPet doesn't trigger? Using ItemInfo works for now
		if (vendorItem.type === 'item') {
			actualItem = vendorPlayer.items.inventory.get(vendorItem.slotID);
			if (!actualItem) return;
			client.write(ItemPackets.info(actualItem));
		} else if (vendorItem.type === 'pet') {
			const pet = vendorPlayer.findPetById(vendorItem.slotID);
			if (!pet) return;
			client.write(PetPackets.petInfo(pet));
		}
	}

	private VendorPurchaseItem(packet: Buffer, client: PlayerConnection): void {
		const index = packet.readUInt16LE(16);
		const vendorItem: PlayerVendor | null = client.player.memory.vendorItems?.[index] ?? null;
		if (!vendorItem) return;

		const itemCount = packet.readUInt8(20);
		const vendorPlayerId = packet.readUInt16LE(12);
		const vendorPlayer = client.game.players.get(vendorPlayerId);
		if (!vendorPlayer) {
			client.write(MessagePackets.showSystem('Vendor not found!'));
			return;
		}

		if (vendorItem.type === 'item') {
			const item = vendorPlayer.items.inventory.get(vendorItem.slotID);
			if (!item) return;

			const totalPrice = vendorItem.price * itemCount;
			if (totalPrice > client.player.items.gold) {
				client.write(MessagePackets.showSystem('Insufficient gold!'));
				return;
			}

			if (!client.player.items.inventory.hasSpaceFor(item.base, itemCount)) {
				client.write(MessagePackets.showSystem('Insufficient inventory space!'));
				return;
			}

			if (item.count < itemCount) {
				client.write(MessagePackets.showSystem("Not enough items in vendor's inventory!"));
				return;
			}

			// Add the items to the player's inventory
			client.player.items.addItemAndSend(item.base, itemCount);

			// Add gold to vendor's account and remove item from vendor's inventory
			vendorPlayer.items.addGoldAndSend(totalPrice);
			vendorPlayer.items.removeItemAndSend(item.base.id, itemCount);

			// Subtract the total price from the buyer's gold
			client.player.items.addGoldAndSend(-totalPrice);

			// Send system messages to both vendor and buyer
			vendorPlayer.client?.write(
				MessagePackets.showSystem(
					`You sold ${itemCount}x ${item.base.name} for ${totalPrice} gold!`,
				),
			);
			client.write(
				MessagePackets.showSystem(
					`You purchased ${itemCount}x ${item.base.name} for ${totalPrice} gold!`,
				),
			);
		} else if (vendorItem.type === 'pet') {
			// Handle pet purchase logic
			const pet = vendorPlayer.findPetById(vendorItem.slotID);
			if (!pet) return;

			// Add pet to buyer and remove from vendor
			client.player.pets.push(pet);
			vendorPlayer.pets = vendorPlayer.pets.filter(p => p !== pet);

			// Also send the appropriate packets
			client.write(PetPackets.add(pet));
			vendorPlayer.client?.write(PetPackets.remove(pet.id));

			// Remove pet from vendor's inventory
			vendorPlayer.memory.vendorItems =
				vendorPlayer.memory.vendorItems?.filter(
					item => item.type !== 'pet' || item.slotID !== pet.id,
				) ?? [];

			// Handle gold transaction
			vendorPlayer.items.addGoldAndSend(vendorItem.price);
			client.player.items.addGoldAndSend(-vendorItem.price);

			vendorPlayer.client?.write(
				MessagePackets.showSystem(`You sold ${pet.name} for ${vendorItem.price} gold!`),
			);
			client.write(
				MessagePackets.showSystem(
					`You purchased ${pet.name} for ${vendorItem.price} gold!`,
				),
			);
		}
	}

	private VendorClose(packet: Buffer, client: PlayerConnection): void {
		// Read the character ID from the packet (at offset 12)
		const vendorPlayerId = packet.readUInt16LE(12);

		// Remove shop effect, stops vendor from being opened but does not remove the vendor tag, changing map does remove it tho, npcadd and npcremove could be used but causes flashing due to positions
		client.player.effect.remove(PlayerEffect.Shop);
		client.player.memory.vendorItems = [];
		client.player.memory.vendorName = '';
		client.player.effect.add(PlayerEffect.None);

		// Create response packet with character ID
		const response = new Packet(16, PacketType.VendorClose);
		response.uint16(12, vendorPlayerId); // Set character ID in response

		client.write(response);

		// Send vendor close packet to all players on the map
		client.player.sendVendorCloseToMap(vendorPlayerId);
	}
}
