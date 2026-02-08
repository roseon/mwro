import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles packets regarding stores and banks.
 */
export class StorePacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type === PacketType.StoreBuy;
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
			default:
				this.notImplemented(packet);
		}
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

		if (totalPrice > client.player.items.gold) return;

		if (!client.player.items.inventory.hasSpaceFor(item.base, count)) return;

		client.player.items.addItemAndSend(item.base, count);
		client.player.items.addGoldAndSend(-totalPrice); 
	}
}
