import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';
import { Logger } from '../Logger/Logger';
import { TradePackets } from '../Responses/TradePackets';
import { MessagePackets } from '../Responses/MessagePackets';
import { PetPackets } from '../Responses/PetPackets';
import { Pet } from '../GameState/Pet/Pet';

/**
 * Handles packets regarding Trading.
 */
export class TradePacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return (
			type === PacketType.TradeRequestSend ||
			type === PacketType.TradeRequestRcv ||
			type === PacketType.TradeRequestClose ||
			type === PacketType.TradeItemList ||
			type === PacketType.TradeShowItem ||
			type === PacketType.TradeReset ||
			type === PacketType.TradeConfirm
		);
	}

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public handlePacket(packet: Buffer, client: PlayerConnection): void {
		if (!this.hasPlayer(client)) return;

		let type = getPacketType(packet);

		switch (type) {
			// View vendor item
			case PacketType.TradeRequestSend:
				this.tradeRequestSend(packet, client);
				break;
			// Send trade to target player
			case PacketType.TradeRequestRcv:
				this.tradeRequestRcv(packet, client);
				break;
			// Cancel trade
			case PacketType.TradeRequestClose:
				this.tradeRequestClose(packet, client);
				break;
			// Reset trade
			case PacketType.TradeReset:
				this.tradeReset(packet, client);
				break;
			// List items in trade
			case PacketType.TradeItemList:
				this.tradeItemList(packet, client);
				break;
			// Show item in trade
			case PacketType.TradeShowItem:
				this.tradeShowItem(packet, client);
				break;
			// Confirm trade
			case PacketType.TradeConfirm:
				this.tradeConfirm(packet, client);
				break;
			default:
				this.notImplemented(packet);
		}
	}

	private tradeRequestSend(packet: Buffer, client: PlayerConnection): void {
		//Reset trade memory
		client.player.clearTradeMemory();

		let targetId = packet.readUInt32LE(12);
		client.player.memory.tradeTargetId = targetId;
		Logger.info(`Trade request sent to ${targetId}`);

		const targetPlayer = client.game.players.get(targetId);
		if (!targetPlayer || !targetPlayer.client) {
			// Target player not found or not connected
			return;
		}
		if (targetPlayer.memory.tradeTargetId === null) {
			targetPlayer.memory.tradeTargetId = client.player.id;
			targetPlayer.client.write(TradePackets.tradeRequestRcv(client.player.id));
			client.write(TradePackets.tradeRequestSend(targetPlayer.id));
		} else {
			client.write(TradePackets.tradeRequestFail());
			client.player.clearTradeMemory();

		}
	}

	private tradeRequestRcv(packet: Buffer, client: PlayerConnection): void {
		// TODO: Implement
	}

	private tradeRequestClose(packet: Buffer, client: PlayerConnection): void {
		// TODO: Implement
		Logger.info(`Trade request closed`);
		const targetId = client.player.memory.tradeTargetId;
		if (targetId === null) return;
		const targetPlayer = client.game.players.get(targetId);
		if (!targetPlayer || !targetPlayer.client) {
			// Target player not found or not connected
			return;
		}

		client.write(TradePackets.tradeRequestClose());
		targetPlayer.client.write(TradePackets.tradeRequestClose());

		client.player.clearTradeMemory();
		targetPlayer.clearTradeMemory();
	}

	private tradeReset(packet: Buffer, client: PlayerConnection): void {
		// TODO: Implement
		Logger.info(`Trade reset`);
		const targetId = client.player.memory.tradeTargetId;
		if (targetId === null) return;
		const targetPlayer = client.game.players.get(targetId);
		if (!targetPlayer || !targetPlayer.client) {
			// Target player not found or not connected
			return;
		}
		const playerId = client.player.id;

		client.player.memory.itemsOffering = [];
		client.player.memory.itemsOffered = [];
		targetPlayer.memory.itemsOffering = [];
		targetPlayer.memory.itemsOffered = [];

		if (client.player.memory.tradeConfirm || targetPlayer.memory.tradeConfirm) {
			client.write(TradePackets.tradeRequestClose());
			targetPlayer.client.write(TradePackets.tradeRequestClose());
			client.player.clearTradeMemory();
			targetPlayer.clearTradeMemory();
		}
		client.write(TradePackets.tradeReset(playerId));
		targetPlayer.client.write(TradePackets.tradeReset(playerId));

		client.write(TradePackets.tradeReset(targetId));
		targetPlayer.client.write(TradePackets.tradeReset(targetId));
	}

	private tradeItemList(packet: Buffer, client: PlayerConnection): void {
		const itemCount = 3;
		const offsets = {
			indices: 16, // Starting offset for indices
			counts: 28, // Starting offset for counts
		};

		const targetId = client.player.memory.tradeTargetId;
		if (targetId === null) return;
		const targetPlayer = client.game.players.get(targetId);
		if (!targetPlayer || !targetPlayer.client) return;

		// Initialize arrays with null values for all 3 slots
		client.player.memory.itemsOffering = new Array(itemCount).fill(null);
		targetPlayer.memory.itemsOffered = new Array(itemCount).fill(null);

		const tradeItems = Array.from({ length: itemCount }, (_, i) => {
			const index = packet.readUInt32LE(offsets.indices + i * 4);
			const count = packet.readUInt32LE(offsets.counts + i * 4);

			// Check if this is a pet (index >= 100)
			if (index >= 100) {
				const petIndex = index - 100;
				const pet = client.player.pets[petIndex];
				if (pet) {
					// Store pet in memory arrays
					client.player.memory.itemsOffering[i] = pet;
					targetPlayer.memory.itemsOffered[i] = pet;
					return {
						index: pet.file + 10000,
						count: 1,
					};
				}
			}

			// Check if index is within valid inventory range (0-23)
			if (index < 0 || index > 23) {
				return {
					index: 4294967295, // 0xFFFFFFFF for empty slot
					count: 0,
				};
			}
			// Get the actual item from inventory
			const item = client.player.items.inventory.get(index);
			if (item) {
				// Store items at specific indices instead of pushing
				client.player.memory.itemsOffering[i] = item;
				targetPlayer.memory.itemsOffered[i] = item;
			}

			return {
				index: item?.file ?? 4294967295,
				count: count,
			};
		});

		const goldOffered = packet.readUInt32LE(40);

		if (goldOffered > 0) {
			client.player.memory.goldOffered = goldOffered;
			targetPlayer.memory.goldOffering = goldOffered;
		}

		client.write(TradePackets.tradeItemList());
		targetPlayer.client.write(TradePackets.tradeShowItem(tradeItems, goldOffered));
		Logger.info('Trade item list', { tradeItems });
		Logger.info('Trade target id', { targetId });
	}

	private tradeShowItem(packet: Buffer, client: PlayerConnection): void {
		// TODO: Implement
		Logger.info(`Trade show item`);
	}

	private tradeConfirm(packet: Buffer, client: PlayerConnection): void {
		client.player.memory.tradeConfirm = true;
		const targetId = client.player.memory.tradeTargetId;
		if (targetId === null) return;

		const targetPlayer = client.game.players.get(targetId);
		if (!targetPlayer || !targetPlayer.client) {
			// Target player not found or not connected
			return;
		}
		if (targetPlayer.memory.tradeConfirm) {
			//Both players confirmed, conduct trade
			Logger.info(`Trade confirmed by both players`);
			
			// Handle gold transfer
			if (client.player.memory.goldOffered > 0) {
				client.player.items.giveGoldAndSend(targetId, client.player.memory.goldOffered);
				client.write(MessagePackets.showSystem(`You gave ${targetPlayer.name} ${client.player.memory.goldOffered} gold`));
				targetPlayer.client.write(MessagePackets.showSystem(`${client.player.name} gave you ${client.player.memory.goldOffered} gold`));
			}
			if (targetPlayer.memory.goldOffered > 0) {
				targetPlayer.items.giveGoldAndSend(client.player.id, targetPlayer.memory.goldOffered);
				targetPlayer.client.write(MessagePackets.showSystem(`You gave ${client.player.name} ${targetPlayer.memory.goldOffered} gold`));
				client.write(MessagePackets.showSystem(`${targetPlayer.name} gave you ${targetPlayer.memory.goldOffered} gold`));
			}

			// Get arrays of items being traded
			const player1Items = client.player.memory.itemsOffering;
			const player2Items = targetPlayer.memory.itemsOffering;

			// Process items from player1 to player2
			if (player1Items) {
				const itemIndexes: number[] = [];
				const itemCounts: number[] = [];
				const petsToTransfer: any[] = [];

				player1Items.forEach((item, index) => {
					if (!item) return;

					if (item instanceof Pet) {
						petsToTransfer.push(item);
					} else {
						// Find item in inventory
						const invIndex = Array.from(client.player.items.inventory.entries()).findIndex(([_, i]) => i === item);
						if (invIndex !== -1) {
							itemIndexes.push(invIndex);
							itemCounts.push(1);
						}
					}
				});

				// Transfer regular items
				if (itemIndexes.length > 0) {
					client.player.items.giveItemToPlayerAndSend(targetId, itemIndexes, itemCounts);
				}

				// Transfer pets
				petsToTransfer.forEach(pet => {
					// Add pet to target player
					targetPlayer.pets.push(pet);
					// Remove pet from source player
					client.player.pets = client.player.pets.filter(p => p !== pet);
					// Send packets
					targetPlayer.client?.write(PetPackets.add(pet));
					client.write(PetPackets.remove(pet.id));
					client.write(MessagePackets.showSystem(`You gave ${targetPlayer.name} ${pet.name}`));
					targetPlayer.client?.write(MessagePackets.showSystem(`${client.player.name} gave you ${pet.name}`));
				});
			}

			// Process items from player2 to player1
			if (player2Items) {
				const itemIndexes: number[] = [];
				const itemCounts: number[] = [];
				const petsToTransfer: any[] = [];

				player2Items.forEach((item, index) => {
					if (!item) return;

					if (item instanceof Pet) {
						petsToTransfer.push(item);
					} else {
						// Find item in inventory
						const invIndex = Array.from(targetPlayer.items.inventory.entries()).findIndex(([_, i]) => i === item);
						if (invIndex !== -1) {
							itemIndexes.push(invIndex);
							itemCounts.push(1); 
						}
					}
				});

				// Transfer regular items
				if (itemIndexes.length > 0) {
					targetPlayer.items.giveItemToPlayerAndSend(client.player.id, itemIndexes, itemCounts);
				}

				// Transfer pets
				petsToTransfer.forEach(pet => {
					// Add pet to target player
					client.player.pets.push(pet);
					// Remove pet from source player
					targetPlayer.pets = targetPlayer.pets.filter(p => p !== pet);
					// Send packets
					client.write(PetPackets.add(pet));
					targetPlayer.client?.write(PetPackets.remove(pet.id));
					client.write(MessagePackets.showSystem(`You gave ${targetPlayer.name} ${pet.name}`));
					targetPlayer.client?.write(MessagePackets.showSystem(`${client.player.name} gave you ${pet.name}`));
				});
			}

			// Close trade for both players
			client.write(TradePackets.tradeRequestClose());
			targetPlayer.client.write(TradePackets.tradeRequestClose());

			// Clear trade memory for both players
			client.player.clearTradeMemory();
			targetPlayer.clearTradeMemory();
		}

		Logger.info(`Trade confirm`);
	}
}
