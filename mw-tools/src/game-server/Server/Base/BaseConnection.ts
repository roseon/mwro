import type { Socket } from 'net';

/**
 * Wraps around node's net.Socket.
 */
export abstract class BaseConnection {
	protected constructor(protected readonly socket: Socket) {
		socket.setDefaultEncoding('binary');
		socket.setTimeout(30_000);

		socket.on('data', data => this.onData(data));
		socket.on('close', hadError => this.onClose(hadError));
		socket.on('end', () => this.onEnd?.());
		socket.on('error', err => this.onError(err));
		socket.on('timeout', () => this.onTimeout());
	}

	/**
	 * Close the connection to the client.
	 */
	public closeConnection(): void {
		this.socket.end();
	}

	/**
	 * Called when recieving data from the client.
	 * @param data
	 */
	protected abstract onData(data: Buffer): void;

	/**
	 * Called when the connection has been closed.
	 * @param hadError
	 */
	protected abstract onClose(hadError: boolean): void;

	/**
	 * Called when the connection gets ended by the client.
	 * Happens before onClose.
	 */
	protected onEnd?(): void;

	/**
	 * Called when a connection error happens.
	 * Happens before onClose.
	 * @param error
	 */
	protected abstract onError(error: Error): void;

	/**
	 * Called when the connection times out.
	 */
	protected abstract onTimeout(): void;
}
