import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import { versionPacket } from '../Responses/Pregame/Version';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles packets that happen before the player enters the game world.
 */
export class PreGamePacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type === PacketType.KeepAlive || type === PacketType.Version;
	}

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public handlePacket(packet: Buffer, client: PacketConnection): void {
		let type = getPacketType(packet);

		switch (type) {
			// Version-check
			case PacketType.Version:
				client.write(versionPacket);
				break;

			// Client answers a ping we sent elsewhere
			case PacketType.KeepAlive:
				// Now what
				break;

			default:
				this.notImplemented(packet);
		}
	}
}
