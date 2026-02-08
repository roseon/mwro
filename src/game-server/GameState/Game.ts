import { BaseItemCollection } from '../Database/Collections/BaseItem/BaseItemCollection';
import type { BaseItem } from '../Database/Collections/BaseItem/BaseItemTypes';
import { GameDataCollection } from '../Database/Collections/GameData/GameDataCollection';
import { NpcCollection } from '../Database/Collections/Npc/NpcCollection';
import { GameActionCache } from '../GameActions/GameActionCache';
import { GameConditionCache } from '../GameActions/GameConditionCache';
import type { PositionManager } from '../PositionManager/PositionManager';
import { MapPackets } from '../Responses/MapPackets';
import type { Fight } from './Fight/Fight';
import { GameMap } from './Map/GameMap';
import { Npc } from './Npc/Npc';
import type { Player } from './Player/Player';
import type { BaseQuest } from './Quest/BaseQuest';

export class Game {
	public maps: Map<number, GameMap> = new Map();

	public baseItems: Map<number, BaseItem> = new Map();

	public baseQuests: Map<number, BaseQuest> = new Map();

	public npcs: Map<number, Npc> = new Map();

	public players: Map<number, Player> = new Map();

	public users: string[] = [];

	public fights: Set<Fight> = new Set();

	public constructor(public positionManager: PositionManager) {}

	public async init(): Promise<void> {
		await GameActionCache.getInstance().ready;
		await GameConditionCache.getInstance().ready;
		await this.loadMaps();
		await this.loadNpcs();
		await this.loadBaseItems();
		await this.loadBaseQuests();
	}

	/**
	 * Called when a player enters the game.
	 * @param player
	 */
	public onPlayerEnter(player: Player): void {
		if (this.players.has(player.id)) throw Error('Player is already in the game.');

		this.players.set(player.id, player);
		this.positionManager.onPlayerEnter(player);
	}

	/**
	 * Called when a player leaves the game.
	 * @param player
	 */
	public onPlayerLeave(player: Player): void {
		this.players.delete(player.id);
		this.positionManager.onPlayerLeave(player);
	}

	/**
	 * Called when a user logs in
	 * @param user
	 */
	public onUserLogin(user: string): void {
		if (this.users.includes(user)) throw Error('User is already logged in.');

		this.users.push(user);
	}

	/**
	 * Called when a user logs out.
	 * @param user
	 */
	public onUserLeave(user: string): void {
		let index = this.users.indexOf(user);
		this.users.splice(index, 1);
	}

	/**
	 * Add an npc to the game.
	 * @param npc
	 */
	public addNpc(npc: Npc): void {
		// Handle time-based spawns first
		if (npc.spawnTime) {
			if (npc.spawnByTime()) {
				npc.mapData.map.npcs.push(npc);
				this.npcs.set(npc.id, npc);
				npc.mapData.map.sendPacket(MapPackets.npcAdd([npc]));
			} else {
				// Calculate time until spawn
				const [hours, minutes] = npc.spawnTime.split(':').map(Number);
				const now = new Date();
				const spawnTime = new Date(now);
				spawnTime.setHours(hours, minutes, 0, 0);

				const delay = spawnTime.getTime() - now.getTime();

				setTimeout(() => {
					npc.mapData.map.npcs.push(npc);
					this.npcs.set(npc.id, npc);
					npc.mapData.map.sendPacket(MapPackets.npcAdd([npc]));
				}, delay);
			}
			return;
		}

		// Skip if spawnByDefault is false
		if (!npc.spawnByDefault) {
			return;
		}

		npc.mapData.map.npcs.push(npc);
		this.npcs.set(npc.id, npc);
		npc.mapData.map.sendPacket(MapPackets.npcAdd([npc]));
	}

	/**
	 * Remove an npc from the game.
	 * @param npc
	 */
	public removeNpc(npc: Npc): void {
		let index = npc.mapData.map.npcs.indexOf(npc);

		if (index !== -1) npc.mapData.map.npcs.splice(index, 1);

		this.npcs.delete(npc.id);
	}

	/**
	 * Load all static maps.
	 */
	private async loadMaps(): Promise<void> {
		let mapDataList = await (await GameDataCollection.getInstance().getMaps()).get();

		for (let mapJson of mapDataList) {
			let map = new GameMap(mapJson);
			this.maps.set(map.id, map);
		}
	}

	/**
	 * Load all static npcs.
	 */
	private async loadNpcs(): Promise<void> {
		let npcData = await NpcCollection.getInstance().getAll();
		for (let json of npcData) {
			let npc = new Npc(json, this.maps);
			this.addNpc(npc);
		}
	}

	/**
	 * Load all base items.
	 */
	private async loadBaseItems(): Promise<void> {
		let items = await BaseItemCollection.getInstance().getAll();
		items.forEach(item => this.baseItems.set(item.id, item));
	}

	/**
	 * Load all base quests.
	 */
	private async loadBaseQuests(): Promise<void> {
		this.baseQuests.set(1, {
			id: 1,
			clientId: 10150,
			stages: new Map([
				[
					0,
					{
						requirements: '',
						reward: 'Nothing',
						situation: 'Actually, go talk to the teleporter in Blython',
					},
				],
			]),
		});

		this.baseQuests.set(1000, {
			id: 1000,
			clientId: 16001,
			stages: new Map([
				[
					0,
					{
						requirements: 'Talk to #GBob#N outside the Woodlingor Herbal shop.',
						reward: 'Gold and exp',
						situation: '#GAlice#N gave you a #GBroom#E.',
					},
				],
				[
					1,
					{
						requirements: 'Talk to #GCharlie#N outside Revive Arena.',
						reward: 'Gold and exp',
						situation: '#GBob#N told you the broom is broken.',
					},
				],
				[
					2,
					{
						requirements: 'Fight some monsters in #GRevive Arena#N',
						reward: 'Gold and exp',
						situation: '#GCharlie#N needs some leaves for some reason.',
					},
				],
				[
					3,
					{
						requirements: 'Talk to #GBob#N',
						reward: 'Gold and exp',
						situation: 'You got the broom fixed.',
					},
				],
			]),
		});
		//battle instructor quest
		this.baseQuests.set(1001, {
			id: 1001,
			clientId: 10110,
			stages: new Map([
				[
					0,
					{
						requirements: 'Learn about your race.',
						reward: 'Pet Egg',
						situation:
							'#rNewbie Guide#w told you about the Sages and the Battle Instructor.',
					},
				],
				[
					1,
					{
						requirements: 'Defeat the #rBattle Instructor#w.',
						reward: 'Pet Egg',
						situation: 'The Battle Instructor has challenged you to a battle.',
					},
				],
				[
					2,
					{
						requirements: 'Return to the #rNewbie Guide#w',
						reward: 'Pet Egg',
						situation: 'You have defeated the Battle Instructor.',
					},
				],
			]),
		});
		//pet keeper quest
		this.baseQuests.set(1002, {
			id: 1002,
			clientId: 10140,
			stages: new Map([
				[
					0,
					{
						requirements: 'Give the Pet Egg to the Pet Keeper.',
						reward: 'Exp and Pet Exp',
						situation: 'Go to the Pet Keeper to hatch your pet.',
					},
				],
				[
					1,
					{
						requirements: 'Hatch the Pet Egg.',
						reward: 'Exp and Pet Exp',
						situation: 'You have hatched your pet.',
					},
				],
				[
					2,
					{
						requirements: 'Hatched a Pet',
						reward: 'Exp and Pet Exp',
						situation: 'Set the pet to active to fight alongside you in battle.',
					},
				],
			]),
		});
	}
}
