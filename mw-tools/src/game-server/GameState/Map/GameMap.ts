import { monsterTemplates } from '../../Data/MonsterTemplates';
import type { MapJson } from '../../Database/Collections/GameData/types';
import type { Weather } from '../../Enums/Weather';
import type { ClientActionContext } from '../../GameActions/GameActionContext';
import type { GameActionExecutable } from '../../GameActions/GameActionExecutable';
import { GameActionParser } from '../../GameActions/GameActionParser';
import { Logger } from '../../Logger/Logger';
import type { Packet } from '../../PacketBuilder';
import { FightCreator } from '../Fight/FightCreator';
import type { Npc } from './../Npc/Npc';
import type { Player } from './../Player/Player';

export class GameMap {
	public readonly id: number;

	public readonly name: string;

	public readonly file: number;

	public readonly musicFile: number = 0;

	public readonly minimapFile: number | null;

	public readonly minimapEnabled: boolean;

	public readonly fightMusicFile: number = 0;

	public readonly fightBackgroundFile: number;

	public readonly hasRandomFights: boolean;

	public readonly fightFrequency: number = 0;

	public weather: Weather = 0;

	public readonly npcs: Npc[] = [];

	public readonly players: Map<number, Player> = new Map();

	private readonly randomMonsters: string[];

	private readonly onMapPlayerFightWin: GameActionExecutable<ClientActionContext> | null = null;

	public constructor(json: MapJson) {
		this.id = json.id;
		this.file = json.file;
		this.name = json.name;
		this.minimapEnabled = json.minimapFile !== null;
		this.minimapFile = json.minimapFile;
		this.fightBackgroundFile = json.fightBackgroundFile;
		this.musicFile = json.musicFile;
		this.fightMusicFile = json.fightMusicFile;
		this.randomMonsters = json.randomMonsters;
		this.hasRandomFights = this.randomMonsters.length !== 0;
		this.onMapPlayerFightWin = GameActionParser.parse(json.onMapPlayerFightWin);
		this.fightFrequency = json.fightFrequency;
	}

	/**
	 * Starts a random monster fight.
	 * @param player
	 */
	public startRandomFight(player: Player): void {
		if (!this.hasRandomFights || player.fightData.stats.currentHp <= 0) return;
		let monsters = this.randomMonsters;

		// Check if monster repel is active and not expired
		if (player.memory.monsterRepel && player.memory.monsterRepelExpiry > Date.now()) {
			let playerLevel = player.level.level;

			// Filter out monsters that are lower level than the player
			monsters = this.randomMonsters.filter(monsterKey => {
				let monsterTemplate = monsterTemplates[monsterKey];
				return monsterTemplate.level > playerLevel;
			});
		} else if (player.memory.monsterRepel) {
			// Expired
			player.memory.monsterRepel = false;
			player.memory.monsterRepelExpiry = 0;
		}

		// If no monsters are left after filtering, end the fight initiation
		if (monsters.length === 0) {
			Logger.info(`Player ${player.name} avoided a random fight due to monster repel.`);
			return;
		}

		Logger.info(`Monsters available for random fight: ${monsters.join(', ')}`);

		let fight = FightCreator.createRandom(player, monsters);
		fight.onMapPlayerFightWin = this.onMapPlayerFightWin;

		fight.start();
	}

	/**
	 * Send packet to all players in this map.
	 * @param packet
	 * @param exclude
	 */
	public sendPacket(packet: Buffer | Packet, exclude: Player | null = null): void {
		for (let player of this.players.values()) {
			if (player !== exclude) player.client?.write(packet);
		}
	}
}
