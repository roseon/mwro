import type { Socket } from 'net';
import type { Player } from '../../GameState/Player/Player';
import type { PacketConnection } from '../Packet/PacketConnection';
import { PacketHandlerCollection } from '../Packet/PacketHandlerCollection';
import { PacketServer } from '../Packet/PacketServer';
import { ChatConnection } from './ChatConnection';
import { ChatServerChannelWriter } from './ChatServerChannelWriter';

/**
 * The chat server.
 */
export class ChatServer extends PacketServer {
	private expectedPlayers: Map<string, Player> = new Map();
	private channelWriter: ChatServerChannelWriter = new ChatServerChannelWriter();

	public constructor(host: string, port: number) {
		super('Chat', PacketHandlerCollection.createForChatServer(), host, port);
	}

	/**
	 * Start the chat server.
	 */
	public start(): void {
		this.listen();
	}

	/**
	 * The player will be connecting from the given address any moment.
	 * @param player
	 * @param remoteAddress
	 */
	public expectPlayer(player: Player, remoteAddress: string): void {
		this.expectedPlayers.set(remoteAddress, player);
		// TODO clear after time
	}

	/**
	 * Initialises the connection object for this socket.
	 * @param socket
	 */
	protected override createConnection(socket: Socket): PacketConnection | null {
		let remoteAddress = socket.remoteAddress;
		if (!remoteAddress) return null;

		let player = this.expectedPlayers.get(remoteAddress);
		if (!player) return null;

		this.expectedPlayers.delete(remoteAddress);

		return new ChatConnection(socket, this, this.packetHandlers, this.channelWriter, player);
	}
}
