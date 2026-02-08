import type { Socket } from 'net';
import type { UserCollection } from '../../Database/Collections/User/UserCollection';
import type { Game } from '../../GameState/Game';
import type { Player } from '../../GameState/Player/Player';
import type { User } from '../../GameState/User';
import type { NonNullableProps } from '../../Utils/TypeUtils';
import { PacketConnection } from '../Packet/PacketConnection';
import type { PacketHandlerCollection } from '../Packet/PacketHandlerCollection';
import type { GameServer } from './GameServer';

export type UserConnection = NonNullableProps<GameConnection, 'user'>;
export type PlayerConnection = NonNullableProps<GameConnection, 'user' | 'player'>;

/**
 * A client connection to the game server.
 * Connection happens after the user picks a server, before logging in.
 */
export class GameConnection extends PacketConnection {
	public user: User | null = null;

	public userCollection: UserCollection | null = null;

	public player: Player | null = null;

	public constructor(
		socket: Socket,
		private gameServer: GameServer,
		packetHandlers: PacketHandlerCollection,
		public game: Game,
	) {
		super(socket, gameServer, packetHandlers);
	}

	/**
	 * Called when a player picks a character, so the game and chat connections can get linked.
	 */
	public prepareForChatConnection(): void {
		if (this.hasPlayer() && this.socket.remoteAddress)
			this.gameServer.prepareForChatConnection(this.player, this.socket.remoteAddress);
	}

	/**
	 * Check if this connection has a user.
	 */
	public hasUser(): this is UserConnection {
		return this.user !== null;
	}

	/**
	 * Check if this connection has a player.
	 */
	public hasPlayer(): this is PlayerConnection {
		return this.player !== null;
	}

	/**
	 * Check if Player ID is already logged in
	 */
	public hasLoggedInPlayer(id: number): boolean {
		let loggedIn: number[] = [];

		for (let client of this.gameServer.game.players.values()) {
			loggedIn.push(client.id);
		}

		return loggedIn.includes(id);
	}

	/**
	 * Check if username is already logged in
	 */
	public hasLoggedInUser(username: string): boolean {
		return this.game.users.includes(username);
	}

	/**
	 * Called when the connection has been closed.
	 * @param hadError
	 */
	protected override onClose(hadError: boolean): void {
		if (this.player) {
			const player = this.player;
			player.playerCollection?.updatePlayer(player).catch(err => {
				this.server.log(`Failed to save player ${player.name} on close:`, err);
			});
			this.game.onPlayerLeave(player);
			player.client = null;
			this.player = null;
		}

		super.onClose(hadError);
	}
}
