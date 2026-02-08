import { BaseItemCollection } from '../Database/Collections/BaseItem/BaseItemCollection';
import { PlayerCollection } from '../Database/Collections/Player/PlayerCollection';
import { BaseQuestCollection } from '../Database/Collections/Quest/BaseQuestCollection';
import type { BaseItem } from '../Database/Collections/BaseItem/BaseItemTypes';
import { GameDataCollection } from '../Database/Collections/GameData/GameDataCollection';
import { NpcCollection } from '../Database/Collections/Npc/NpcCollection';
import { GameActionCache } from '../GameActions/GameActionCache';
import { GameConditionCache } from '../GameActions/GameConditionCache';
import { loadPetTemplates } from '../Data/PetTemplates';
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
		await loadPetTemplates();
		await this.loadMaps();
		await this.loadNpcs();
		await this.loadBaseItems();
		await this.loadBaseQuests();
		this.startAutoSave();
	}

	/**
	 * Starts the auto save loop.
	 */
	private startAutoSave(): void {
		const saveInterval = 20 * 60 * 1000; // 20 minutes

		setInterval(async () => {
			if (this.players.size === 0) return;

			console.log(`Auto-saving ${this.players.size} players...`);
			const playerCollection = PlayerCollection.getInstance();

			for (const player of this.players.values()) {
				try {
					await playerCollection.updatePlayer(player);
				} catch (e) {
					console.error(`Failed to auto-save player ${player.name}:`, e);
				}
			}
			console.log('Auto-save complete.');
		}, saveInterval);
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

				let delay = spawnTime.getTime() - now.getTime();
				if (delay < 0) {
					// If delay is negative, it means the spawn time for today is in the past.
					// Add 24 hours to spawnTime to schedule for tomorrow.
					spawnTime.setDate(spawnTime.getDate() + 1);
					delay = spawnTime.getTime() - now.getTime();
				}

				setTimeout(() => {
					npc.mapData.map.npcs.push(npc);
					this.npcs.set(npc.id, npc);
					npc.mapData.map.sendPacket(MapPackets.npcAdd([npc]));
				}, Math.max(0, delay)); // Ensure delay is not negative
			}
			return;
		}

		// Skip if spawnByDefault is false
		if (npc.spawnByDefault === false) {
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

		npcData.push({
			id: 2147487744,
			name: 'Nurse',
			file: 114,
			map: 1,
			point: { x: 502, y: 850 },
			direction: 5,
			action: {
				type: 'npcSay',
				message: 'Would you like me to put a bandade on?',
				options: [
					{
						condition: { type: 'gold', amount: 100 },
						text: '#GHeal me please (100 gold)#E',
						action: [
							{ type: 'gold', amount: -100 },
							{ type: 'heal', hp: 100, mp: 100, isPerc: true },
							{ type: 'heal', hp: 100, mp: 100, pet: true, isPerc: true },
						],
					},
					{
						condition: { type: 'gold', amount: 100, not: true },
						text: '#RHeal me please (100 gold)#E',
						action: {
							type: 'npcSay',
							message: 'Sorry, you cant afford my services right now.',
						},
					},
					{ text: '#YClose#E' },
				],
			},
		} as any);

		// Replace Charlie with Nurse
		let charlieIndex = -1;
		for (let i = 0; i < npcData.length; i++) {
			if (npcData[i].id === 2147487746) {
				charlieIndex = i;
				break;
			}
		}
		if (charlieIndex !== -1) {
			npcData[charlieIndex] = {
				...npcData[charlieIndex],
				name: 'Nurse',
				file: 114,
				action: {
					type: 'npcSay',
					message: 'Would you like me to put a bandade on?',
					options: [
						{
							condition: { type: 'gold', amount: 100 },
							text: '#GHeal me please (100 gold)#E',
							action: [
								{ type: 'gold', amount: -100 },
								{ type: 'heal', hp: 100, mp: 100, isPerc: true },
								{ type: 'heal', hp: 100, mp: 100, pet: true, isPerc: true },
							],
						},
						{
							condition: { type: 'gold', amount: 100, not: true },
							text: '#RHeal me please (100 gold)#E',
							action: {
								type: 'npcSay',
								message: 'Sorry, you cant afford my services right now.',
							},
						},
						{ text: '#YClose#E' },
					],
				},
			} as any;
		}

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
		let quests = await BaseQuestCollection.getInstance().getAll();
		quests.forEach(quest => {
			if (quest.stages.size === 0) {
				quest.stages.set(0, {
					requirements: '',
					situation: '',
					reward: '',
				});
			}
			this.baseQuests.set(quest.id, quest);
		});

		// Hardcoded fallback for testing if not yet in DB
		if (!this.baseQuests.has(1)) {
			this.baseQuests.set(1, {
				id: 1,
				clientId: 10150,
				stages: new Map([
					[
						0,
						{
							requirements: '',
							situation: 'Actually, go talk to the teleporter in Blython',
							reward: 'Nothing',
						},
					],
				]),
			});
		}
	}

	/**
	 * Save all player data.
	 */
	public async saveAllPlayers(): Promise<void> {
		for (const player of this.players.values()) {
			if (player.playerCollection) await player.playerCollection.updatePlayer(player);
		}
	}
}
