import type { PetTemplate } from '../../Data/PetTemplates';
import type { PlayerCollection } from '../../Database/Collections/Player/PlayerCollection';
import type {
	PendingMailJson,
	PetJsonCollection,
	PlayerJsonCollection,
} from '../../Database/Collections/Player/PlayerJson';
import type { CharacterClass, CharacterGender, CharacterRace } from '../../Enums/CharacterClass';
import { PlayerEffect } from '../../Enums/PlayerEffect';
import type { ClientActionContext } from '../../GameActions/GameActionContext';
import type { GameActionExecutable } from '../../GameActions/GameActionExecutable';
import { GameActionParser } from '../../GameActions/GameActionParser';
import type { GameAction } from '../../GameActions/GameActionTypes';
import { PetPackets } from '../../Responses/PetPackets';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import type { GameConnection, PlayerConnection } from '../../Server/Game/GameConnection';
import { Bitfield } from '../../Utils/Bitfield';
import { FightStats } from '../Fight/FightStats';
import type { Game } from '../Game';
import type { Guild } from '../Guild';
import type { IndividualJson } from '../Individual/Individual';
import { Individual } from '../Individual/Individual';
import type { IndividualFightDataJson } from '../Individual/IndividualFightData';
import type { IndividualMapDataJson } from '../Individual/IndividualMapData';
import { Item, ItemJson } from '../Item/Item';
import type { ItemContainerJson } from '../Item/ItemContainer';
import { ItemContainer } from '../Item/ItemContainer';
import { Level } from '../Level';
import type { Party } from '../Party';
import type { Pet } from '../Pet/Pet';
import { PetCreator } from '../Pet/PetCreator';
import { PlayerQuests } from '../Quest/PlayerQuests';
import { PlayerCreator } from './PlayerCreator';
import { PlayerFightData } from './PlayerFightData';
import { PlayerFriends } from './PlayerFriends';
import { PlayerItems } from './PlayerItems';
import { MailItem, PendingMail } from './PlayerMail';
import { PlayerMapData } from './PlayerMapData';
import { PlayerMemory } from './PlayerMemory';
import { PlayerMisc } from './PlayerMisc';
import type { PlayerTitlesJson } from './PlayerTitles';
import { PlayerTitles } from './PlayerTitles';

export type PlayerJson = IndividualJson & {
	fightData: IndividualFightDataJson;
	mapData: IndividualMapDataJson;
	gender: CharacterGender;
	race: CharacterRace;
	onPlayerFightWin?: GameActionExecutable<ClientActionContext>;
	pendingMail?: PendingMailJson[];
	titles: PlayerTitlesJson;
};

export class Player extends Individual {
	public playerCollection: PlayerCollection | null = null;

	public client: PlayerConnection | null = null;

	public fightData: PlayerFightData;

	public mapData: PlayerMapData;

	public titles: PlayerTitles;

	public quests: PlayerQuests;

	public gender: CharacterGender;

	public race: CharacterRace;

	public effect: Bitfield = new Bitfield(PlayerEffect.None);

	public level: Level = Level.fromLevel(1);

	public party: Party | null = null;

	public guild: Guild | null = null;

	public misc: PlayerMisc = new PlayerMisc();

	public friends: PlayerFriends = new PlayerFriends();

	public get class(): CharacterClass {
		return this.race * 2 + this.gender;
	}

	public items: PlayerItems = new PlayerItems(this);

	public pets: Pet[] = [];

	public activePet: Pet | null = null;

	public memory: PlayerMemory = new PlayerMemory();

	public pendingMail: PendingMail = new PendingMail();

	public onPlayerFightWin: GameActionExecutable<ClientActionContext> = GameActionParser.parse({
		type: 'monster',
	} as GameAction);

	public fightStats: FightStats;

	public constructor(
		json: PlayerJson,
		public game: Game,
	) {
		super(json);
		this.race = json.race;
		this.gender = json.gender;
		this.fightData = new PlayerFightData(json.fightData);
		this.mapData = new PlayerMapData(json.mapData, game.maps);
		this.quests = new PlayerQuests(this);
		this.fightStats = new FightStats(this);
		this.pendingMail = new PendingMail();
		this.titles = new PlayerTitles(json.titles);
	}

	/**
	 * Sets the file based on race, gender and reborn.
	 */
	public useDefaultFile(): void {
		this.file = this.class + 1;

		if (this.level.reborn > 0) this.file += 10;
	}

	public async addPet(petTemplate: PetTemplate): Promise<void> {
		let pet = await PetCreator.create(petTemplate);

		this.client?.write(PetPackets.add(pet));
		this.pets.push(pet);
	}

	/**
	 * Send the vendor open packet to the map, sent when player opens vendor
	 * @param vendorName The name of the vendor
	 */
	public sendVendorOpenToMap(vendorName: string): void {
		if (!vendorName || !this.mapData?.map) return;
		const vendorPacket = PlayerPackets.vendorOpen(this.id, vendorName);
		this.mapData.map.sendPacket(vendorPacket, null);
	}

	/**
	 * Send the vendor close packet to the map
	 * @param vendorPlayerId The ID of the vendor
	 */
	public sendVendorCloseToMap(vendorPlayerId: number): void {
		if (!this.mapData?.map) return;

		const vendorPacket = PlayerPackets.vendorClose(vendorPlayerId);
		this.mapData.map.sendPacket(vendorPacket, null);
	}

	/**
	 * Find a pet by its unique ID
	 * @param id The unique ID of the pet to find
	 * @returns The pet if found, null otherwise
	 */
	public findPetById(id: number): Pet | null {
		return this.pets.find(pet => pet.id === id) ?? null;
	}

	public clearTradeMemory(): void {
		this.memory.tradeTargetId = null;
		this.memory.tradeConfirm = false;
		this.memory.itemsOffered = [];
		this.memory.itemsOffering = [];
		this.memory.goldOffered = 0;
		this.memory.goldOffering = 0;
	}

	public toJson(): PlayerJsonCollection {
		let petList: PetJsonCollection[] = [];

		for (let pet of this.pets.values()) {
			petList.push(pet.toJson());
		}

		return {
			id: this.id,
			name: this.name,
			race: this.race,
			gender: this.gender,
			file: this.file,
			stats: this.fightData.stats.toJson(),
			skills: this.fightData.skills.toJson(),
			mapId: this.mapData.map.id,
			mapDirection: this.mapData.direction,
			mapPoint: this.mapData.point,
			totalExp: this.level.totalExp,
			reborn: this.level.reborn,
			pets: petList,
			titles: this.titles.toJson(),
			guild: this.guild,
			friends: this.friends.getFriendsArray(),
			pendingMail: this.pendingMail.getMails().map(mail => ({
				id: mail.mailID,
				authorID: mail.mailAuthorID,
				authorName: mail.mailAuthorName,
				message: mail.mailMessage,
				timestamp: mail.mailTimestamp,
			})),
			items: this.items.toJson(),
		};
	}

	public static fromJson(player: PlayerJsonCollection, client: GameConnection): Player {
		let tempCharacter = new Player(PlayerCreator.fromJson(player), client.game);
		tempCharacter.level = Level.fromExp(player.totalExp, player.reborn);
		tempCharacter.fightData.resist.updateResistForLevel(
			tempCharacter.level.level,
			tempCharacter.race,
			tempCharacter.gender,
		);

		tempCharacter.guild = player.guild;
		tempCharacter.pets = player.pets.map(pet => PetCreator.fromJson(pet));

		// Load pending mail data
		if (Array.isArray(player.pendingMail)) {
			for (const mail of player.pendingMail) {
				const mailItem = new MailItem(
					mail.authorID,
					mail.message,
					mail.authorName,
					mail.id,
					mail.timestamp,
				);
				tempCharacter.pendingMail.addMail(mailItem);
			}
		}

		if (player.friends) {
			tempCharacter.friends = PlayerFriends.fromJson(player.friends);
		}

		// Load items
		if (player.items) {
			tempCharacter.items = PlayerItems.fromJson(player.items, tempCharacter);
		}

		// Update the fight stats
		tempCharacter.fightStats.update(tempCharacter);

		return tempCharacter;
	}
}
