import type { Game } from '../GameState/Game';
import type { Player } from '../GameState/Player/Player';
import type { PlayerConnection } from '../Server/Game/GameConnection';

export type ClientActionContext = {
	game: Game;
	client: PlayerConnection;
	player: Player;
};

export function createClientContext(client: PlayerConnection): ClientActionContext {
	return {
		client,
		game: client.game,
		player: client.player,
	};
}
