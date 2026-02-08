import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import { PlayerPackets } from '../Responses/PlayerPackets';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles packets regarding basic player data.
 */
export class PlayerDataPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return (
			type === PacketType.PlayerInformation ||
			type === PacketType.PlayerUseStats ||
			type === PacketType.PlayerResist ||
			type === PacketType.PlayerSkills ||
			type === PacketType.PlayerTitleList ||
			type === PacketType.PlayerTitleChange ||
			type === PacketType.PlayerTitleHide ||
			type === PacketType.PromptResponse
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
			// Get all stats
			case PacketType.PlayerInformation:
				client.write(PlayerPackets.information(client.player));
				break;

			// Use stat points
			case PacketType.PlayerUseStats:
				this.onStats(packet, client);
				break;

			// Get resist list
			case PacketType.PlayerResist:
				client.write(PlayerPackets.resist(client.player));
				break;

			// Retrieve skill list
			case PacketType.PlayerSkills:
				client.write(PlayerPackets.skills(client.player));
				break;

			//Player Title List
			case PacketType.PlayerTitleList:
				this.playerTitleList(packet, client);
				break;

			//Player Title Change
			case PacketType.PlayerTitleChange:
				this.playerTitleChange(packet, client);
				break;

			//Player Title Hide
			case PacketType.PlayerTitleHide:
				this.playerTitleHide(packet, client);
				break;

			//Prompt Response
			case PacketType.PromptResponse:
				this.promptResponse(packet, client);
				break;

			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * Happens when the player assigns stat points.
	 * @param packet
	 * @param client
	 */
	private onStats(packet: Buffer, client: PlayerConnection): void {
		let sta = packet.readUInt16LE(18);
		let int = packet.readUInt16LE(20);
		let str = packet.readUInt16LE(22);
		let agi = packet.readUInt16LE(24);

		let sum = sta + int + str + agi;

		if (client.player.fightData.stats.unused < sum) return;

		client.player.fightData.stats.unused -= sum;
		let stats = client.player.fightData.stats;
		stats.hp.pointsBase += sta;
		stats.mp.pointsBase += int;
		stats.attack.pointsBase += str;
		stats.speed.pointsBase += agi;

		// TODO update things?

		client.write(PlayerPackets.useStats(client.player));
	}

	private playerTitleList(packet: Buffer, client: PlayerConnection): void {
		client.write(PlayerPackets.titleList(client.player));
	}

	private playerTitleChange(packet: Buffer, client: PlayerConnection): void {
		// Pending titles are sent in offset 13
		let titleId = packet.readUInt8(12);
		if (titleId === 0 || titleId > 100) {
			// Arbitrary max title ID
			titleId = packet.readUInt8(13);
		}

		if (client.player.titles.setCurrentTitle(titleId)) {
			// Send the title change packet to update the client
			client.write(PlayerPackets.titleChange(client.player));

			// Update other players in the map about the title change
			client.player.mapData.map.sendPacket(PlayerPackets.titleChange(client.player));
		}
	}

	private playerTitleHide(packet: Buffer, client: PlayerConnection): void {
		// Send the title hide packet
		client.player.titles.setCurrentTitle(null);

		client.write(PlayerPackets.titleHide(client.player));
		client.write(PlayerPackets.titleChange(client.player));
		// Update other players in the map about the title change
		client.player.mapData.map.sendPacket(PlayerPackets.titleChange(client.player));
	}

	private promptResponse(packet: Buffer, client: PlayerConnection): void {
		let promptResponse = packet.toString('utf8', 16).replace(/\0+$/, '');

		// Store the response in player memory
		client.player.memory.promptText = promptResponse;

		// Execute the response handler if one exists
		const responseHandler = client.player.memory.promptResponse;
		if (responseHandler) {
			responseHandler.execute({ client, player: client.player, game: client.game });
			// Clear the response handler after execution
			client.player.memory.promptResponse = null;
		}
	}
}
