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
	private buffer: Buffer = Buffer.alloc(0);

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
			
			try {
				if (!this.socket.destroyed && this.socket.writable) {
					this.socket.write(packet);
				}
			} catch (error) {
				this.server.log('Error sending packet:', error);
			}
		}
	}

	/**
	 * Called when recieving data from the client.
	 * @param data
	 */
	protected onData(data: Buffer): void {
		this.buffer = Buffer.concat([this.buffer, data]);

		// Loop while we have at least a header
		while (this.buffer.length > 4) {
			// Bytes 0 and 1 have to be 0x55 and 0x47
			if (this.buffer[0] !== 0x55 || this.buffer[1] !== 0x47) {
				this.server.log('Invalid packet header. Closing connection.');
				this.closeConnection();
				return;
			}

			// Bytes 2 and 3 have to be the packet length - 4
			let length = this.buffer.readUInt16LE(2) + 4;

			if (length > this.buffer.length) {
				// Packet incomplete, wait for more data
				return;
			}

			// Extract the packet
			let packet = this.buffer.subarray(0, length);

			try {
				this.handlePacket(packet);
			} catch (error) {
				this.server.log('Error handling packet:', error);
			}

			// Remove processed packet from buffer
			this.buffer = this.buffer.subarray(length);
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
