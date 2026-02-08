import type { Socket } from 'net';
import { Logger } from '../../Logger/Logger';
import { BaseServer } from '../Base/BaseServer';
import type { PacketConnection } from './PacketConnection';
import type { PacketHandlerCollection } from './PacketHandlerCollection';

/**
 * A server that handles MW packets.
 */
export abstract class PacketServer extends BaseServer {
	/**
	 * All open client connections.
	 */
	public connections: PacketConnection[] = [];

	public constructor(
		/**
		 * Debug name for the server.
		 */
		private name: string,

		/**
		 * The classes that deal with game packets.
		 */
		protected packetHandlers: PacketHandlerCollection,

		host: string,
		port: number,
	) {
		super(host, port);
	}

	/**
	 * Remove the given connection from the list.
	 */
	public removeConnection(connection: PacketConnection): void {
		let index = this.connections.indexOf(connection);

		if (index === -1) throw Error('Attempted to remove non-existing connection.');

		this.connections.splice(index, 1);
	}

	/**
	 * Initialises the connection object for this socket.
	 * @param socket
	 */
	protected abstract createConnection(socket: Socket): PacketConnection | null;

	/**
	 * Called when a new connection is made.
	 * @param socket
	 */
	protected onConnection(socket: Socket): void {
		let connection = this.createConnection(socket);

		if (connection === null) return;

		this.connections.push(connection);
	}

	/**
	 * Called when the server closes.
	 * Happens after all connections are closed.
	 */
	protected onClose(): void {
		// TODO do we need to do anything here?
		this.log('Server was closed.');
	}

	/**
	 * Called when an error happens in the tcp server.
	 * @param err
	 */
	protected onError(err: Error): void {
		// TODO when does this happen?
		this.log('Server error', err);
	}

	/**
	 * Start accepting connections.
	 */
	protected override listen(): void {
		this.log('Server started.');
		super.listen();
	}

	/**
	 * Log method for convenience.
	 * @param params
	 */
	public log(...params: unknown[]): void {
		Logger.info(`[${this.name}]`, ...params);
	}
}
