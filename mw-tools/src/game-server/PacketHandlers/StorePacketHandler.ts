import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';
import { MessagePackets } from '../Responses/MessagePackets';
import { PlayerPackets } from '../Responses/PlayerPackets';
import { ItemPackets } from '../Responses/ItemPackets';
import { NpcType } from '../Database/Collections/Npc/NpcJson';

/**
 * Handles packets regarding stores and banks.
 */
export class StorePacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type === PacketType.StoreBuy || type === PacketType.StoreSell;
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
			case PacketType.StoreBuy:
				this.onStoreBuy(packet, client);
				break;
			case PacketType.StoreSell:
				this.onStoreSell(packet, client);
				break;
			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * Called when the player sells items to an NPC buyer.
	 * @param packet
	 * @param client
	 */
	private onStoreSell(packet: Buffer, client: PlayerConnection): void {
		const activeNpc = client.player.memory.activeNpc;
		if (!activeNpc || activeNpc.type !== NpcType.Buyer) return;

		const count = packet.readUInt16LE(12);
		const index = packet.readUInt16LE(14);
		if (!count) return;

		const item = client.player.items.inventory.get(index);
		if (!item || item.locked || item.questItem) return;
		if (item.count < count) return;

		const basePrice = item.price > 0 ? item.price : Math.max(1, item.level || 1);
		const sellPrice = Math.max(1, Math.floor(basePrice * 0.5));
		const totalPrice = sellPrice * count;

		item.count -= count;
		if (item.count <= 0) {
			client.player.items.inventory.delete(index);
			client.write(ItemPackets.remove(index));
		} else {
			client.write(ItemPackets.change([[index, item]]));
		}

		client.player.items.addGoldAndSend(totalPrice);
		client.write(MessagePackets.showSystem(`Sold ${count}x ${item.base.name} for ${totalPrice} gold.`));
	}

	/**
	 * Called when the players buys from a shop.
	 * @param packet
	 * @param client
	 */
	private onStoreBuy(packet: Buffer, client: PlayerConnection): void {
		let count = packet.readUInt16LE(12);
		let index = packet.readUInt16LE(14);
		let item = client.player.memory.npcItems?.[index];

		if (!item || !count) return;

		let totalPrice = item.price * count;

        // Special handling for Crab Pit Shop (Reputation Points)
        if (client.player.memory.shopName === 'crabPitShop') {
            if (totalPrice > client.player.misc.reputation) {
                client.write(MessagePackets.showSystem("Not enough Reputation Points!"));
                return;
            }
            
            if (!client.player.items.inventory.hasSpaceFor(item.base, count)) {
                client.write(MessagePackets.showSystem("Not enough inventory space!"));
                return;
            }

            // Deduct RP and add Item
            client.player.misc.reputation -= totalPrice;
            client.write(PlayerPackets.misc(client.player)); // Update client UI
            client.player.items.addItemAndSend(item.base, count);
            
            client.write(MessagePackets.showSystem(`Purchased ${count} ${item.base.name}.`));
            return;
        }

		if (totalPrice > client.player.items.gold) {
            client.write(MessagePackets.showSystem("Not enough Gold!"));
            return;
        }

		if (!client.player.items.inventory.hasSpaceFor(item.base, count)) {
            client.write(MessagePackets.showSystem("Not enough inventory space!"));
            return;
        }

		client.player.items.addItemAndSend(item.base, count);
		client.player.items.addGoldAndSend(-totalPrice); 
	}
}
