import { Worker } from 'worker_threads';
import type { Game } from '../GameState/Game';
import type { GameMap } from '../GameState/Map/GameMap';
import type { Player } from '../GameState/Player/Player';
import { ResourceManager } from '../ResourceManager/ResourceManager';
import { MapPackets } from '../Responses/MapPackets';
import type { Point } from '../Utils/Point';
import type { MapFileJson } from './Server/MapLinks';
import { MapLinks } from './Server/MapLinks';
import { ServerPositionPlayerData } from './Server/ServerPositionPlayerData';
import type { PositionWorkerParams } from './Worker/PositionWorker';
import type { PositionUpdate } from './Worker/WorkerPositionPlayerData';
import { Random } from '../Utils/Random';
import { FriendPackets } from '../Responses/FriendPackets';
import { Logger } from '../Logger/Logger';

/**
 * Manages the players' positions, map changes and so on.
 */
export class PositionManager {
	private readonly resMapData = ResourceManager.get('mapData') as MapFileJson[];
	private readonly resMapCells = ResourceManager.get('mapCells');
	private readonly workerPath: string = module.path + '/Worker/PositionWorker.js';
	private readonly worker: Worker;
	private readonly playerData: SharedArrayBuffer;
	private readonly positionPlayerData: ServerPositionPlayerData;
	private readonly mapLinks: Map<number, MapLinks> = new Map();
	private game!: Game;

	public constructor() {
		let size = ServerPositionPlayerData.getBufferSize();
		this.playerData = new SharedArrayBuffer(size);
		this.worker = this.createWorker();
		this.positionPlayerData = new ServerPositionPlayerData(this.playerData);
	}

	/**
	 * Called when the game object is initialised.
	 * @param game
	 */
	public initGame(game: Game): void {
		this.game = game;

		this.resMapData.forEach(data => {
			let cells = this.resMapCells.find(x => x.map === data.map);

			if (!cells) return;

			this.mapLinks.set(data.map, new MapLinks(data, game.maps, cells.buffer));
		});

		this.worker.on('message', (updates: PositionUpdate[]) => this.onWorkerUpdate(updates));
		this.worker.on('error', (err) => {
			Logger.error('PositionWorker Error:', err);
		});
		this.worker.on('exit', (code) => {
			if (code !== 0) {
				Logger.error(`PositionWorker stopped with exit code ${code}`);
			}
		});
	}

	/**
	 * Called by the Game-class when a player enters the game.
	 * The player's mapData should be set before this.
	 * @param player
	 */
	public onPlayerEnter(player: Player): void {
		player.mapData.map.players.set(player.id, player);
		// TODO check if player is in fight

		const inds = [...player.mapData.map.players.values(), ...player.mapData.map.npcs];
		inds.splice(inds.indexOf(player), 1);

		player.client?.write(
			...MapPackets.mapData(player),
			MapPackets.npcList(player),
			MapPackets.enter,
			FriendPackets.friendList(player.friends.getFriendsArray(), this.game.players),
		);

		// Send vendor open packets after npcList
		MapPackets.sendVendorOpenPackets(inds);

		// Send online status for each online friend
		for (const friend of player.friends.getFriendsArray()) {
			const onlineFriend = this.game.players.get(friend.id);
			if (onlineFriend) {
				player.client?.write(FriendPackets.friendOnline(friend.id));
			}
		}

		// Notify all players who have this player in their friends list
		for (const [_, otherPlayer] of this.game.players) {
			if (otherPlayer.friends.hasFriend(player.id)) {
				otherPlayer.client?.write(FriendPackets.friendOnline(player.id));
			}
		}

		player.mapData.map.sendPacket(MapPackets.npcAdd([player]), player);
		this.positionPlayerData.addPlayer(player);
	}

	/**
	 * Called when the player leaves the game.
	 * @param player
	 */
	public onPlayerLeave(player: Player): void {
		player.mapData.map.players.delete(player.id);
		player.mapData.map.sendPacket(MapPackets.npcRemove([player]), player);
		this.positionPlayerData.removePlayer(player.id);

		// Notify all players who have this player in their friends list
		for (const [_, otherPlayer] of this.game.players) {
			if (otherPlayer.friends.hasFriend(player.id)) {
				otherPlayer.client?.write(FriendPackets.friendOffline(player.id));
			}
		}
	}

	/**
	 * Called when a player wants to walk somewhere.
	 * @param player
	 * @param x
	 * @param y
	 */
	public onDestChange(player: Player, dest: Point): void {
		let old = player.mapData.point;

		this.destChange(player, dest);

		if (player.party?.leader) {
			// Calculate direction so leader is always that the front
			let diffX = dest.x - old.x;
			let diffY = dest.y - old.y;
			let x = 0;
			let y = 0;
			if (diffX < 0) x = 10;
			else x = -10;
			if (diffY < 0) y = 10;
			else y = -10;

			for (let member of player.party.members) {
				if (member == player) continue;
				dest = dest.add(x, y);
				this.destChange(member, dest);
			}
		}
	}

	private destChange(player: Player, dest: Point): void {
		player.mapData.dest = dest;
		player.mapData.map.sendPacket(MapPackets.walkDestinations([player]));
		this.positionPlayerData.writeDestToBuffer(player);
	}

	/**
	 * Called when the player moves to another map.
	 * @param player
	 * @param newMap
	 */
	public onRequestMapChange(player: Player, newMap: GameMap, point: Point): void {
		if (player.party) {
			for (let member of player.party.members) {
				this.mapChange(member, newMap, point);
			}
		} else {
			this.mapChange(player, newMap, point);
		}
	}

	/**
	 * Move player to new map
	 * @param player
	 * @param newMap
	 */
	private mapChange(player: Player, newMap: GameMap, point: Point): void {
		player.mapData.map.players.delete(player.id);
		player.mapData.map.sendPacket(MapPackets.npcRemove([player]), player);

		player.mapData.map = newMap;
		player.mapData.point = point;
		player.mapData.dest = point;
		newMap.players.set(player.id, player);
		this.positionPlayerData.updatePlayerMap(player);

		const inds = [...newMap.players.values(), ...newMap.npcs];
		inds.splice(inds.indexOf(player), 1);

		player.client?.write(
			...MapPackets.mapData(player),
			MapPackets.npcList(player),
			MapPackets.change,
		);

		// Send vendor open packets after npcList
		MapPackets.sendVendorOpenPackets(inds);

		newMap.sendPacket(MapPackets.npcAdd([player]), player);
	}

	/**
	 * Called when the worker sends an update on player positions.
	 * @param updates
	 */
	private onWorkerUpdate(updates: [(PositionUpdate & { type?: string; error?: any })] | PositionUpdate[]): void {
		try {
			// Handle error messages from worker
			if (!Array.isArray(updates) || (updates.length > 0 && 'type' in updates[0] && updates[0].type === 'error')) {
				const errorMsg = updates as any; // Cast to access potential error property
				if (errorMsg.error || (errorMsg[0] && errorMsg[0].error)) {
					Logger.error('PositionWorker reported error:', errorMsg.error || errorMsg[0].error);
					return;
				}
			}

			(updates as PositionUpdate[]).forEach(update => {
				if ('type' in update && update['type'] === 'error') return; // Skip error objects if mixed

				let player = this.game.players.get(update.id);
	
				if (!player) return;
	
				this.positionPlayerData.writeCoordinatesToPlayer(player);
	
				let mapLinks = this.mapLinks.get(player.mapData.map.file);
				let link = mapLinks?.getMapLink(player.mapData.point);
	
				if (link?.dest) {
					let dest = link.getDestinationCoordinates();
					this.onRequestMapChange(player, link.dest, dest);
				} else if (
					player.mapData.map.hasRandomFights &&
					player.mapData.map.fightFrequency > 0
				) {
					if (player.party) {
						if (player.party.leader != player) return;
					}
	
					player.memory.stepCount += update.steps;
					/**
					 * Random number to add to stepCount
					 * Requires atleast 10% steps before you can enter combat
					 */
					let randomStep = Random.intInclusive(0, player.mapData.map.fightFrequency * 0.9);
	
					if (player.memory.stepCount + randomStep > player.mapData.map.fightFrequency) {
						player.memory.stepCount = 0;
						player.mapData.map.startRandomFight(player);
					}
				}
			});
		} catch (error) {
			Logger.error('Error in onWorkerUpdate:', error);
		}
	}

	/**
	 * Create the worker that updates player positions.
	 */
	private createWorker(): Worker {
		let workerData: PositionWorkerParams = {
			playerData: this.playerData,
			mapData: this.resMapData.map(data => ({
				map: data.map,
				width: data.width,
				height: data.height,
				cells: this.resMapCells.find(x => x.map === data.map)!.shared,
			})),
		};

		let worker = new Worker(this.workerPath, { workerData });

		return worker;
	}
}
