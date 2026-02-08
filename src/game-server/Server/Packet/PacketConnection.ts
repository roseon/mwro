import type { Socket } from 'net';
import { Packet } from '../../PacketBuilder';
import { getPacketType, readPackets } from '../../PacketReader';
import { PacketType } from '../../PacketType';
import { BaseConnection } from './../Base/BaseConnection';
import type { PacketHandlerCollection } from './PacketHandlerCollection';
import type { PacketServer } from './PacketServer';

/**
 * A connection to a packet server.
 */
export abstract class PacketConnection extends BaseConnection {
	protected constructor(
		socket: Socket,
		protected readonly server: PacketServer,
		protected readonly packetHandlers: PacketHandlerCollection,
	) {
		super(socket);
	}

	/**
	 * Sends the data to the client.
	 * @param packets
	 */
	public write(...packets: (Buffer | Packet | null)[]): void {
		for (let packet of packets) {
			if (!packet) continue;

			if (packet instanceof Packet) packet = packet.buffer;

			let type = getPacketType(packet);
			// Avoid logging excessive packets
			if(!["WalkDestinations"].includes(PacketType[type]))
				this.server.log('Send', PacketType[type]);
			this.socket.write(packet);
		}
	}

	/**
	 * Called when recieving data from the client.
	 * @param data
	 */
	protected onData(data: Buffer): void {
		let packets = readPackets(data);

		for (let packet of packets) {
			this.handlePacket(packet);
		}
	}

	/**
	 * Forwards a packet to the appropriate packet handler.
	 * @param packet
	 */
	protected handlePacket(packet: Buffer): void {
		let type = getPacketType(packet);
		// Avoid logging excessive packets
		if(!["PlayerMove"].includes(PacketType[type]))
			this.server.log(`Receive ${PacketType[type]}`);
		let handler = this.packetHandlers.getPacketHandler(type);

		if (handler === null) {
			this.server.log(
				`Unhandled packet type ${type.toString(16)} ${PacketType[type]}`,
				packet,
			);
			return;
		}

		handler.handlePacket(packet, this);
	}

	/**
	 * Called when the connection has been closed.
	 * @param hadError
	 */
	protected onClose(hadError: boolean): void {
		this.server.removeConnection(this);
		this.server.log('Socket closed' + (hadError ? ' with an error' : ''));
	}

	/**
	 * Called when a connection error happens.
	 * Happens before onClose.
	 * @param error
	 */
	protected onError(error: Error): void {
		// TODO do we need to do anything here?
		this.server.log('Socket error', error);
	}

	/**
	 * Close the connection on timeout.
	 */
	protected onTimeout(): void {
		// TODO use ping packets to check the connection
		// this.socket.end();
	}
}
