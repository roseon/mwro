import type { Socket } from 'net';
import type { Game } from '../../GameState/Game';
import type { Player } from '../../GameState/Player/Player';
import type { ChatServer } from '../Chat/ChatServer';
import type { PacketConnection } from '../Packet/PacketConnection';
import { PacketHandlerCollection } from '../Packet/PacketHandlerCollection';
import { PacketServer } from '../Packet/PacketServer';
import { GameConnection } from './GameConnection';

/**
 * The game server.
 */
export class GameServer extends PacketServer {
	private chatServer!: ChatServer;

	public constructor(
		/**
		 * The global game state.
		 */
		public game: Game,
		host: string,
		port: number,
	) {
		super('Game', PacketHandlerCollection.createForGameServer(), host, port);
	}

	/**
	 * Start the gameserver.
	 * @param chatServer
	 */
	public start(chatServer: ChatServer): void {
		this.chatServer = chatServer;
		this.listen();
	}

	/**
	 * Let the chat server know from what address a player will be coming.
	 * @param player
	 * @param remoteAddress
	 */
	public prepareForChatConnection(player: Player, remoteAddress: string): void {
		this.chatServer.expectPlayer(player, remoteAddress);
	}

	/**
	 * Initialises the connection object for this socket.
	 * @param socket
	 */
	protected createConnection(socket: Socket): PacketConnection {
		return new GameConnection(socket, this, this.packetHandlers, this.game);
	}
}
