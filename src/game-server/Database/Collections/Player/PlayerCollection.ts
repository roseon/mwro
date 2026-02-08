import { petTemplates } from '../../../Data/PetTemplates';
import { CharacterGender, CharacterRace } from '../../../Enums/CharacterClass';
import { EquipmentSlot } from '../../../Enums/EquipmentSlot';
import { MapID } from '../../../Enums/MapID';
import { Item } from '../../../GameState/Item/Item';
import { Level } from '../../../GameState/Level';
import { Player } from '../../../GameState/Player/Player';
import { PlayerCreator } from '../../../GameState/Player/PlayerCreator';
import type { GameConnection } from '../../../Server/Game/GameConnection';
import { Point } from '../../../Utils/Point';
import { Random } from '../../../Utils/Random';
import { BaseCollection } from '../BaseCollection';
import type { PetJsonCollection, PlayerJsonCollection } from './PlayerJson';

type CharDeps = { client: GameConnection };

export class PlayerCollection extends BaseCollection<Player, PlayerJsonCollection, CharDeps> {
	private static instance: PlayerCollection | null = null;

	protected constructor() {
		super('Player');
	}

	public static getInstance(): PlayerCollection {
		if (this.instance === null) this.instance = new PlayerCollection();

		return this.instance;
	}

	public getKey(obj: Player): string {
		return obj.id.toString();
	}

	public async getPlayer(id: number, client: GameConnection): Promise<Player> {
		let player = null;
		try {
			let col = await this.collection;
			player = await col.get(id.toString());
		} catch {
			throw Error(`Player with ID ${id} does not exist`);
		}

		return this.fromJson(player, { client });
	}

	public async testPlayer(client: GameConnection): Promise<Player> {
		let testProps = await PlayerCreator.create(CharacterRace.Human, CharacterGender.Male, '');
		testProps.name = 'Player ' + testProps.id;
		testProps.mapData = {
			map: MapID.Woodlingor,
			direction: Random.int(0, 8),
			point: new Point(475, 250).getRandomNearby(0, 10).toMapPoint(),
		};

		let test = new Player(testProps, client.game);

		test.level = Level.fromLevel(10);
		let { stats, skills, resist } = test.fightData;
		stats.updateStatPointsForLevel(test.level.level);
		resist.updateResistForLevel(test.level.level, test.race, test.gender);
		stats.healHp();
		stats.healMp();

		test.titles.addTitle(2);

		test.items.gold = 5000;
		test.items.bankGold = 10000;

		let item = new Item(client.game.baseItems.get(1)!);
		test.items.equipment.set(EquipmentSlot.Weapon, item);

		await test.addPet(petTemplates.bloodpede);
		test.activePet = test.pets[0];

		// Update the player fight stats
		test.fightStats.update(test);

		this.saveNewPlayer(test);
		if (client.user) client.userCollection?.updateUser(client.user);

		return test;
	}

	/**
	 * Save a new player to the database.
	 * @param player
	 */
	public async saveNewPlayer(player: Player): Promise<void> {
		let key = this.getKey(player);
		if (await this.exists(key)) throw Error('Player with this key already exists.');

		let json = this.toJson(player);

		await (await this.collection).upsert(key, json);
	}

	/**
	 * Save an existing player.
	 * @param player
	 */
	public async updatePlayer(player: Player): Promise<void> {
		let col = await this.collection;
		let key = this.getKey(player);
		let cur = await col.get(key);

		if (!cur) throw Error('Player does not yet exist.');

		let json = this.toJson(player);

		await col.upsert(key, json);
	}

	public async getAllPlayers(): Promise<PlayerJsonCollection[]> {
		let col = await this.collection;
		return col.getAll();
	}

	/**
	 * Get max id for players
	 */
	public async maxKey(): Promise<number> {
		let col = await this.collection;
		return col.maxKey();
	}

	/**
	 * Get all pets
	 */
	public async getAllPets(): Promise<PetJsonCollection[]> {
		let pets: PetJsonCollection[] = [];

		let players = await this.getAllPlayers();

		for (let player of players) {
			if (player.pets) pets.push(...player.pets);
		}

		return pets;
	}

	/**
	 * Get max id for pets
	 */
	public async maxPetKey(): Promise<number> {
		let max = 0;

		let pets = await this.getAllPets();

		for (let pet of pets) {
			if (pet.id > max) max = pet.id;
		}

		return max;
	}

	/**
	 * Turn database json into Player object.
	 * @param obj
	 */
	protected toJson(player: Player): PlayerJsonCollection {
		return player.toJson();
	}

	/**
	 * Turn the username into the database key.
	 * @param username
	 */
	protected fromJson(player: PlayerJsonCollection, { client }: CharDeps): Player {
		return Player.fromJson(player, client);
	}
}
