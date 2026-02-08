import 'source-map-support/register';
import { getConfig } from './Config/Config';
import { Game } from './GameState/Game';
import { enableGlobalErrorCatching } from './Logger/Logger';
import { PositionManager } from './PositionManager/PositionManager';
import { ResourceManager } from './ResourceManager/ResourceManager';
import { addAllResources } from './Resources';
import { ChatServer } from './Server/Chat/ChatServer';
import { GameServer } from './Server/Game/GameServer';

enableGlobalErrorCatching();

(async () => {
	// Preload some resources
	addAllResources();
	await ResourceManager.load();
	let { world, chat } = getConfig();

	// Initialise game
	let pm = new PositionManager();
	let game = new Game(pm);
	await game.init();
	pm.initGame(game);

	// Start the servers
	let gameServer = new GameServer(game, world.ip, world.port);
	let chatServer = new ChatServer(chat.ip, chat.port);
	chatServer.start();
	gameServer.start(chatServer);
})();
