import { Logger } from '../Logger/Logger';
import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import type { PlayerConnection, UserConnection } from '../Server/Game/GameConnection';
import { GameConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';

export abstract class AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public abstract handlesType(type: PacketType): boolean;

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public abstract handlePacket(packet: Buffer, client: PacketConnection): void;

	/**
	 * Warn when a packet is not yet implemented.
	 * @param packet
	 */
	protected notImplemented(packet: Buffer): void {
		let type = getPacketType(packet);
		Logger.warn('Unhandled packet type ' + type.toString(16) + ' ' + PacketType[type]);
	}

	/**
	 * Check if the client has a user.
	 * @param client
	 */
	protected hasUser(client: PacketConnection): client is UserConnection {
		return client instanceof GameConnection && client.hasUser();
	}

	/**
	 * Check if the client has a player.
	 * @param client
	 */
	protected hasPlayer(client: PacketConnection): client is PlayerConnection {
		return this.hasUser(client) && client.hasPlayer();
	}
}
