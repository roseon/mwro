import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { Point } from '../Utils/Point';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles packets regarding the movement of the player.
 */
export class MovingPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return (
			type === PacketType.PlayerMove ||
			type === PacketType.WalkDestinations ||
			type === PacketType.UpdateCoordinates
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
			case PacketType.PlayerMove:
			case PacketType.WalkDestinations:
			case PacketType.UpdateCoordinates:
				this.onPlayerMove(packet, client);
				break;
			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * Update the game state when the player moves.
	 * @param packet
	 * @param player
	 */
	private onPlayerMove(packet: Buffer, client: PlayerConnection): void {
		let id = packet.readUInt32LE(16);

		if (id !== client.player.id) return;

		let x = packet.readUInt16LE(20);
		let y = packet.readUInt16LE(22);

		/*
		uint16 24: always 1?
		uint16 26: 0, 70 or 168
			0 when clicking somewhere
			70 when keeping mouse down while moving around
			168 when "swiping", mouse down on one spot, quickly moving it elsewhere, and letting go
			You often get a 168 before a series of 70
		*/

		client.game.positionManager.onDestChange(client.player, new Point(x, y));
	}
}
