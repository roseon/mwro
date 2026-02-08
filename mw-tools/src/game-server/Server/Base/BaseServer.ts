import type { Server, Socket } from 'net';
import { createServer } from 'net';

/**
 * Wraps around node's net.Server.
 */
export abstract class BaseServer {
	private server: Server;

	protected constructor(private host: string, private port: number) {
		this.server = createServer();

		this.server.on('connection', socket => this.onConnection(socket));
		this.server.on('close', () => this.onClose());
		this.server.on('error', error => this.onError(error));
	}

	/**
	 * Called when a new connection is made.
	 * @param socket
	 */
	protected abstract onConnection(socket: Socket): void;

	/**
	 * Called when the server closes.
	 * Happens after all connections are closed.
	 */
	protected abstract onClose(): void;

	/**
	 * Called when an error happens in the tcp server.
	 * @param error
	 */
	protected abstract onError(error: Error): void;

	/**
	 * Start accepting connections.
	 */
	protected listen(): void {
		this.server.listen(this.port, this.host);
	}
}
