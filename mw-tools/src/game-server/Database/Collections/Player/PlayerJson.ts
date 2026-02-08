import type { CharacterGender, CharacterRace } from '../../../Enums/CharacterClass';
import type { Guild } from '../../../GameState/Guild';
import type { PlayerTitlesJson } from '../../../GameState/Player/PlayerTitles';
import type { SkillsGroupJson } from '../../../GameState/Skills/SkillsGroup';
import type { StatsJson } from '../../../GameState/Stats/Stats';
import type { Point } from '../../../Utils/Point';
import type { Resist } from '../../../GameState/Resist';
import { ItemJson } from '../../../GameState/Item/Item';
import type { ItemContainerJson } from '../../../GameState/Item/ItemContainer';
import { PlayerItemsJson } from '../../../GameState/Player/PlayerItems';

export type PetJsonCollection = {
	id: number;
	baseName: string;
	name: string;
	file: number;
	stats: StatsJson;
	skillList: SkillsGroupJson[];
	totalExp: number;
	reborn: number;
	loyalty: number;
	intimacy: number;
	resist: Partial<Resist>;
};
export interface PendingMailJson {
	id: number;
	authorID: number;
	authorName: string;
	message: string;
	timestamp: number;
}

export interface PlayerMisc {
	// TODO: Define misc properties
	[key: string]: any;
}

export type PlayerJsonCollection = {
	name: string;
	race: CharacterRace;
	gender: CharacterGender;
	id: number;
	file: number;
	stats: StatsJson;
	skills: SkillsGroupJson[];
	mapId: number;
	mapDirection: number;
	mapPoint: Point;
	totalExp: number;
	reborn: number;
	pets: PetJsonCollection[];
	activePetId?: number;
	titles: PlayerTitlesJson;
	guild: Guild | null;
	friends: {
		id: number;
		points: number;
	}[];
	pendingMail: PendingMailJson[];
	items: PlayerItemsJson;
	quests: PlayerQuestJson[];
	misc?: PlayerMisc;
};

export type PlayerQuestJson = {
	id: number;
	stage: number;
};
