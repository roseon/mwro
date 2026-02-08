import { Skill } from '../Enums/Skill';
import { Species } from '../Enums/Species';
import type { GameAction } from '../GameActions/GameActionTypes';
import type { MonsterRewardsJson } from '../GameState/Monster/MonsterRewards';
import type { SkillsGroupJson } from '../GameState/Skills/SkillsGroup';
import type { BaseStats, RandomStatRates } from '../GameState/Stats/StatRates';
import { Logger } from '../Logger/Logger';

/**
 * Template used to create monsters and pets.
 */
export type BaseMonsterTemplate = {
	name: string;
	file: number;
	statRates: RandomStatRates;
	species: Species;
};

/**
 * A monster the player can fight against.
 */
export type MonsterTemplate = BaseMonsterTemplate & {
	build: BaseStats; // Not the final stats, will be multiplied to match level
	level: number;
	rewards?: MonsterRewardsJson;
	onMonsterPlayerFightWin?: GameAction | null;
	skills?: SkillsGroupJson[];
	onFightClose?: GameAction | null;
};

// Temporary, will be moved to db
export const monsterTemplates: Record<string, MonsterTemplate> = {
	greenCapilla: {
		name: 'Green Capilla',
		file: 254,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.184, max: 1.213 },
			sta: { min: 86, max: 86 },
			int: { min: 238, max: 238 },
			str: { min: 18, max: 18 },
			agi: { min: 34, max: 34 },
		},
		build: { sta: 1, int: 3, str: 1, agi: 1 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 2,
		rewards: {
			expBase: 30,  // Level 2
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	greenCapillaBoss: {
		name: 'Green Capilla Boss',
		file: 254,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.184, max: 1.213 },
			sta: { min: 86, max: 86 },
			int: { min: 238, max: 238 },
			str: { min: 18, max: 18 },
			agi: { min: 34, max: 34 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 4,
		rewards: {
			expBase: 65,  // Level 4
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	teethor: {
		name: 'Teethor',
		file: 222,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.158, max: 1.182 },
			sta: { min: 85, max: 85 },
			int: { min: 224, max: 224 },
			str: { min: 16, max: 16 },
			agi: { min: 115, max: 115 },
		},
		build: { sta: 1, int: 3, str: 1, agi: 4 },
		skills: [
			{ id: Skill.IceI, exp: 0 },
			{ id: Skill.IceII, exp: 0 },
			{ id: Skill.IceIII, exp: 0 },
			{ id: Skill.IceIV, exp: 0 },
		],
		level: 13,
		rewards: {
			expBase: 450,  // Level 13
			goldBase: 2,
		},
	},
	antEater: {
		name: 'Ant Eater',
		file: 205,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.149, max: 1.179 },
			sta: { min: 145, max: 145 },
			int: { min: 52, max: 52 },
			str: { min: 18, max: 18 },
			agi: { min: 69, max: 69 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		skills: [
			{ id: Skill.FrailtyI, exp: 0 },
			{ id: Skill.FrailtyII, exp: 0 },
			{ id: Skill.FrailtyIII, exp: 0 },
			{ id: Skill.FrailtyIV, exp: 0 },
		],
		level: 6,
		rewards: {
			expBase: 120,  // Level 6
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	battleInstructor: {
		name: 'Battle Instructor',
		file: 125,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.149, max: 1.179 },
			sta: { min: 35, max: 40 },
			int: { min: 52, max: 52 },
			str: { min: 12, max: 13 },
			agi: { min: 69, max: 69 },
		},
		build: { sta: 3, int: 1, str: 2, agi: 1 },
		level: 5,
	},
	nepenthes: {
		name: 'Nepenthes',
		file: 223,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.144, max: 1.174 },
			sta: { min: 95, max: 95 },
			int: { min: 147, max: 147 },
			str: { min: 19, max: 19 },
			agi: { min: 100, max: 100 },
		},
		build: { sta: 2, int: 2, str: 1, agi: 3 },
		skills: [
			{ id: Skill.PoisonI, exp: 0 },
			{ id: Skill.FrailtyII, exp: 0 },
			{ id: Skill.PoisonIII, exp: 0 },
			{ id: Skill.FrailtyIV, exp: 0 },
		],
		level: 8,
		rewards: {
			expBase: 180,  // Level 8
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilAntEater: {
		name: 'Evil Ant Eater',
		file: 205,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.149, max: 1.179 },
			sta: { min: 145, max: 145 },
			int: { min: 52, max: 52 },
			str: { min: 18, max: 18 },
			agi: { min: 69, max: 69 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 8,
		rewards: {
			expBase: 180,  // Level 8
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	poisonTeethor: {
		name: 'Poison Teethor',
		file: 222,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.158, max: 1.182 },
			sta: { min: 85, max: 85 },
			int: { min: 224, max: 224 },
			str: { min: 16, max: 16 },
			agi: { min: 115, max: 115 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 12,
		rewards: {
			expBase: 380,  // Level 12
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	earthWolf: {
		name: 'Earth Wolf',
		file: 207,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.166, max: 1.196 },
			sta: { min: 96, max: 96 },
			int: { min: 69, max: 69 },
			str: { min: 26, max: 26 },
			agi: { min: 144, max: 144 },
		},
		build: { sta: 2, int: 1, str: 4, agi: 4 },
		skills: [
			{ id: Skill.FlashI, exp: 0 },
			{ id: Skill.FlashII, exp: 0 },
			{ id: Skill.FlashIII, exp: 0 },
			{ id: Skill.FlashIV, exp: 0 },
		],
		level: 13,
		rewards: {
			expBase: 450,  // Level 13
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilNepenthes: {
		name: 'Evil Nepenthes',
		file: 223,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.144, max: 1.174 },
			sta: { min: 95, max: 95 },
			int: { min: 147, max: 147 },
			str: { min: 19, max: 19 },
			agi: { min: 100, max: 100 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 14,
		rewards: {
			expBase: 500,  // Level 14
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	flowerSpirit: {
		name: 'Flower Spirit',
		file: 223, //TODO
		species: Species.Special, //TODO
		statRates: {
			//TODO
			growthRate: { min: 1.158, max: 1.182 },
			sta: { min: 85, max: 85 },
			int: { min: 224, max: 224 },
			str: { min: 16, max: 16 },
			agi: { min: 115, max: 115 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 16, //TODO
		rewards: {
			expBase: 600,  // Level 16
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	lizardBandit: {
		name: 'Lizard Bandit',
		file: 224,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.134, max: 1.164 },
			sta: { min: 88, max: 88 },
			int: { min: 112, max: 112 },
			str: { min: 18, max: 18 },
			agi: { min: 62, max: 62 },
		},
		build: { sta: 1, int: 2, str: 1, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 46,
		rewards: {
			expBase: 22500,  // Level 46
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	greaterWolf: {
		name: 'Greater Wolf',
		file: 207,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 130, max: 130 },
			int: { min: 286, max: 286 },
			str: { min: 49, max: 49 },
			agi: { min: 141, max: 141 },
		},
		build: { sta: 3, int: 3, str: 5, agi: 5 },
		skills: [
			{ id: Skill.BlizzardI, exp: 0 },
			{ id: Skill.BlizzardII, exp: 0 },
			{ id: Skill.BlizzardIII, exp: 0 },
			{ id: Skill.BlizzardIV, exp: 0 },
		],
		level: 47,
		rewards: {
			expBase: 25000,  // Level 47
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	madOrgewalker: {
		name: 'Mad Ogrewalker',
		file: 252,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.164, max: 1.194 },
			sta: { min: 123, max: 123 },
			int: { min: 48, max: 48 },
			str: { min: 42, max: 42 },
			agi: { min: 60, max: 60 },
		},
		build: { sta: 3, int: 1, str: 5, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 48,
		rewards: {
			expBase: 28000,  // Level 48
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	wanderer: {
		name: 'Wanderer',
		file: 249, //TODO
		species: Species.Human, //TODO
		statRates: {
			//TODO
			growthRate: { min: 1.158, max: 1.182 },
			sta: { min: 85, max: 85 },
			int: { min: 224, max: 224 },
			str: { min: 16, max: 16 },
			agi: { min: 115, max: 115 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 49,
		rewards: {
			expBase: 30000,  // Level 49
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	snakeDemon: {
		name: 'Snake Demon',
		file: 251,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.139, max: 1.169 },
			sta: { min: 89, max: 89 },
			int: { min: 483, max: 483 },
			str: { min: 16, max: 16 },
			agi: { min: 129, max: 129 },
		},
		build: { sta: 1, int: 5, str: 2, agi: 4 },
		skills: [
			{ id: Skill.FlashI, exp: 0 },
			{ id: Skill.FlashII, exp: 0 },
			{ id: Skill.FlashIII, exp: 0 },
			{ id: Skill.FlashIV, exp: 0 },
		],
		level: 50,
		rewards: {
			expBase: 32000,  // Level 50
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	thornSpider: {
		name: 'Thorn Spider',
		file: 227,
		species: Species.Special,
		statRates: {
			//TODO
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 88, max: 88 },
			int: { min: 192, max: 192 },
			str: { min: 22, max: 22 },
			agi: { min: 94, max: 94 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		skills: [
			{ id: Skill.FrailtyI, exp: 0 },
			{ id: Skill.FrailtyII, exp: 0 },
			{ id: Skill.FrailtyIII, exp: 0 },
			{ id: Skill.FrailtyIV, exp: 0 },
		],
		level: 51,
		rewards: {
			expBase: 35000,  // Level 51
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	swordSpider: {
		name: 'Sword Spider',
		file: 225,
		species: Species.Special,
		statRates: {
			//TODO
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 85, max: 85 },
			int: { min: 224, max: 224 },
			str: { min: 16, max: 16 },
			agi: { min: 115, max: 115 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 52,
		rewards: {
			expBase: 38000,  // Level 52
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	iceDemon: {
		name: 'Ice Demon',
		file: 231,
		species: Species.Dragon,
		statRates: {
			growthRate: { min: 1.169, max: 1.194 },
			sta: { min: 110, max: 110 },
			int: { min: 339, max: 339 },
			str: { min: 18, max: 18 },
			agi: { min: 81, max: 81 },
		},
		build: { sta: 3, int: 4, str: 1, agi: 3 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 53,
		rewards: {
			expBase: 40000,  // Level 53
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	magicalDemon: {
		name: 'Magical Demon',
		file: 253,
		species: Species.Dragon,
		statRates: {
			growthRate: { min: 1.171, max: 1.193 },
			sta: { min: 132, max: 132 },
			int: { min: 288, max: 288 },
			str: { min: 23, max: 23 },
			agi: { min: 82, max: 82 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 54,
		rewards: {
			expBase: 42000,  // Level 54
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilMosquito: {
		name: 'Evil Mosquito',
		file: 236,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.205, max: 1.205 },
			sta: { min: 87, max: 87 },
			int: { min: 61, max: 61 },
			str: { min: 17, max: 17 },
			agi: { min: 292, max: 292 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 20,
		rewards: {
			//TODO
			expBase: 900,  // Level 20
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilFireDemon: {
		name: 'Evil Fire Demon',
		file: 233,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.188, max: 1.218 },
			sta: { min: 102, max: 102 },
			int: { min: 368, max: 368 },
			str: { min: 28, max: 28 },
			agi: { min: 78, max: 78 },
		},
		build: { sta: 2, int: 4, str: 4, agi: 2 },
		skills: [
			{ id: Skill.FireI, exp: 0 },
			{ id: Skill.FireII, exp: 0 },
			{ id: Skill.FireIII, exp: 0 },
			{ id: Skill.FireIV, exp: 0 },
		],
		level: 23,
		rewards: {
			expBase: 1400,  // Level 23
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	hellCat: {
		name: 'Hell Cat',
		file: 235,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.156, max: 1.187 },
			sta: { min: 99, max: 99 },
			int: { min: 81, max: 81 },
			str: { min: 29, max: 29 },
			agi: { min: 309, max: 309 },
		},
		build: { sta: 2, int: 1, str: 4, agi: 5 },
		skills: [
			{ id: Skill.SpeedI, exp: 0 },
			{ id: Skill.SpeedII, exp: 0 },
			{ id: Skill.SpeedIII, exp: 0 },
			{ id: Skill.SpeedIV, exp: 0 },
		],
		level: 26,
		rewards: {
			expBase: 1800,  // Level 26
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	scarecrow: {
		name: 'Scarecrow',
		file: 242,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.141, max: 1.172 },
			sta: { min: 91, max: 91 },
			int: { min: 59, max: 59 },
			str: { min: 23, max: 23 },
			agi: { min: 77, max: 77 },
		},
		build: { sta: 2, int: 1, str: 3, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 29,
		rewards: {
			expBase: 2400,  // Level 29
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	hellPhoenix: {
		name: 'Hell Phoenix',
		file: 234,
		species: Species.Dragon,
		statRates: {
			growthRate: { min: 1.178, max: 1.201 },
			sta: { min: 83, max: 83 },
			int: { min: 456, max: 456 },
			str: { min: 19, max: 19 },
			agi: { min: 197, max: 197 },
		},
		build: { sta: 3, int: 5, str: 1, agi: 5 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 32,
		rewards: {
			expBase: 3200,  // Level 32
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	killerBee: {
		name: 'Killer Bee',
		file: 237,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.131, max: 1.161 },
			sta: { min: 112, max: 112 },
			int: { min: 76, max: 76 },
			str: { min: 29, max: 29 },
			agi: { min: 116, max: 116 },
		},
		build: { sta: 3, int: 1, str: 4, agi: 4 },
		skills: [
			{ id: Skill.ProtectI, exp: 0 },
			{ id: Skill.ProtectII, exp: 0 },
			{ id: Skill.ProtectIII, exp: 0 },
			{ id: Skill.ProtectIV, exp: 0 },
		],
		level: 35,
		rewards: {
			expBase: 4000,  // Level 35
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	fireDemon: {
		name: 'Fire Demon',
		file: 233,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.188, max: 1.218 },
			sta: { min: 102, max: 102 },
			int: { min: 368, max: 368 },
			str: { min: 28, max: 28 },
			agi: { min: 78, max: 78 },
		},
		build: { sta: 2, int: 4, str: 4, agi: 2 },
		skills: [
			{ id: Skill.FireI, exp: 0 },
			{ id: Skill.FireII, exp: 0 },
			{ id: Skill.FireIII, exp: 0 },
			{ id: Skill.FireIV, exp: 0 },
		],
		level: 8,
		rewards: {
			expBase: 180,  // Level 8
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	mosquito: {
		name: 'Mosquito',
		file: 236,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.205, max: 1.205 },
			sta: { min: 87, max: 87 },
			int: { min: 61, max: 61 },
			str: { min: 17, max: 17 },
			agi: { min: 292, max: 292 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 5 },
		skills: [
			{ id: Skill.PoisonI, exp: 0 },
			{ id: Skill.PoisonII, exp: 0 },
			{ id: Skill.PoisonIII, exp: 0 },
			{ id: Skill.PoisonIV, exp: 0 },
		],
		level: 11,
		rewards: {
			expBase: 300,  // Level 11
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	bee: {
		name: 'Bee',
		file: 237,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.131, max: 1.161 },
			sta: { min: 112, max: 112 },
			int: { min: 76, max: 76 },
			str: { min: 29, max: 29 },
			agi: { min: 116, max: 116 },
		},
		build: { sta: 3, int: 1, str: 4, agi: 4 },
		skills: [
			{ id: Skill.ProtectI, exp: 0 },
			{ id: Skill.ProtectII, exp: 0 },
			{ id: Skill.ProtectIII, exp: 0 },
			{ id: Skill.ProtectIV, exp: 0 },
		],
		level: 15,
		rewards: {
			expBase: 550,  // Level 15
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	phoenix: {
		name: 'Phoenix',
		file: 234,
		species: Species.Dragon,
		statRates: {
			growthRate: { min: 1.178, max: 1.201 },
			sta: { min: 83, max: 83 },
			int: { min: 456, max: 456 },
			str: { min: 19, max: 19 },
			agi: { min: 197, max: 197 },
		},
		build: { sta: 3, int: 5, str: 1, agi: 5 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 17,
		rewards: {
			expBase: 700,  // Level 17
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	spiritCat: {
		name: 'Spirit Cat',
		file: 235,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 99, max: 99 },
			int: { min: 81, max: 81 },
			str: { min: 29, max: 29 },
			agi: { min: 309, max: 309 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		skills: [
			{ id: Skill.PoisonI, exp: 0 },
			{ id: Skill.PoisonII, exp: 0 },
			{ id: Skill.PoisonIII, exp: 0 },
			{ id: Skill.PoisonIV, exp: 0 },
		],
		level: 38,
		rewards: {
			expBase: 5000,  // Level 38
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilScarecrow: {
		name: 'Evil Scarecrow',
		file: 242,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.141, max: 1.172 },
			sta: { min: 91, max: 91 },
			int: { min: 59, max: 59 },
			str: { min: 23, max: 23 },
			agi: { min: 77, max: 77 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 42,
		rewards: {
			expBase: 6500,  // Level 42
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	guard: {
		name: 'Guard',
		file: 238,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.123, max: 1.153 },
			sta: { min: 115, max: 115 },
			int: { min: 128, max: 128 },
			str: { min: 19, max: 19 },
			agi: { min: 65, max: 65 },
		},
		build: { sta: 3, int: 2, str: 2, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 45,
		rewards: {
			expBase: 20000,  // Level 45
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	axewalker: {
		name: 'Axewalker',
		file: 239,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.123, max: 1.153 },
			sta: { min: 102, max: 102 },
			int: { min: 133, max: 133 },
			str: { min: 24, max: 24 },
			agi: { min: 52, max: 52 },
		},
		build: { sta: 3, int: 2, str: 2, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 48,
		rewards: {
			expBase: 28000,  // Level 48
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	hellGuard: {
		name: 'Hell Guard',
		file: 238,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.123, max: 1.153 },
			sta: { min: 115, max: 115 },
			int: { min: 128, max: 128 },
			str: { min: 19, max: 19 },
			agi: { min: 65, max: 65 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 52,
		rewards: {
			expBase: 38000,  // Level 52
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	riverGuardian: {
		name: 'River Guardian',
		file: 243,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.205, max: 1.225 },
			sta: { min: 104, max: 104 },
			int: { min: 177, max: 177 },
			str: { min: 36, max: 36 },
			agi: { min: 129, max: 129 },
		},
		build: { sta: 3, int: 3, str: 5, agi: 4 },
		skills: [
			{ id: Skill.EnhanceI, exp: 0 },
			{ id: Skill.EnhanceII, exp: 0 },
			{ id: Skill.EnhanceIII, exp: 0 },
			{ id: Skill.EnhanceIV, exp: 0 },
		],
		level: 56,
		rewards: {
			expBase: 50000,  // Level 56
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilAxewalker: {
		name: 'Evil Axewalker',
		file: 239,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.123, max: 1.153 },
			sta: { min: 102, max: 102 },
			int: { min: 133, max: 133 },
			str: { min: 24, max: 24 },
			agi: { min: 52, max: 52 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 57,
		rewards: {
			expBase: 55000,  // Level 57
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	cyclops: {
		name: 'Cyclops',
		file: 230,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.158, max: 1.188 },
			sta: { min: 137, max: 137 },
			int: { min: 98, max: 98 },
			str: { min: 31, max: 31 },
			agi: { min: 36, max: 36 },
		},
		build: { sta: 4, int: 1, str: 4, agi: 1 },
		skills: [
			{ id: Skill.EnhanceI, exp: 0 },
			{ id: Skill.EnhanceII, exp: 0 },
			{ id: Skill.EnhanceIII, exp: 0 },
			{ id: Skill.EnhanceIV, exp: 0 },
		],
		level: 61,
		rewards: {
			expBase: 70000,  // Level 61
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilCyclops: {
		name: 'Evil Cyclops',
		file: 230,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.158, max: 1.188 },
			sta: { min: 137, max: 137 },
			int: { min: 98, max: 98 },
			str: { min: 31, max: 31 },
			agi: { min: 36, max: 36 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 64,
		rewards: {
			expBase: 85000,  // Level 64
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	eyekicker: {
		name: 'Eyekicker',
		file: 244,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.205, max: 1.225 },
			sta: { min: 137, max: 137 },
			int: { min: 98, max: 98 },
			str: { min: 31, max: 31 },
			agi: { min: 36, max: 36 },
		},
		build: { sta: 5, int: 1, str: 4, agi: 1 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 67,
		rewards: {
			expBase: 100000,  // Level 67
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	treeDemon: {
		name: 'Tree Demon',
		file: 246,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.128, max: 1.158 },
			sta: { min: 105, max: 105 },
			int: { min: 359, max: 359 },
			str: { min: 17, max: 17 },
			agi: { min: 62, max: 62 },
		},
		build: { sta: 3, int: 4, str: 1, agi: 2 },
		skills: [
			{ id: Skill.FlashI, exp: 0 },
			{ id: Skill.FlashII, exp: 0 },
			{ id: Skill.FlashIII, exp: 0 },
			{ id: Skill.FlashIV, exp: 0 },
		],
		level: 70,
		rewards: {
			expBase: 120000,  // Level 70
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilTreeDemon: {
		name: 'Evil Tree Demon',
		file: 246,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.128, max: 1.158 },
			sta: { min: 105, max: 105 },
			int: { min: 359, max: 359 },
			str: { min: 17, max: 17 },
			agi: { min: 62, max: 62 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 80,
		rewards: {
			expBase: 160000,  // Level 80
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	bloodpede: {
		name: 'Bloodpede',
		file: 202,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.153, max: 1.183 },
			sta: { min: 86, max: 86 },
			int: { min: 95, max: 95 },
			str: { min: 25, max: 25 },
			agi: { min: 103, max: 103 },
		},
		build: { sta: 1, int: 1, str: 4, agi: 4 },
		skills: [
			{ id: Skill.PoisonI, exp: 0 },
			{ id: Skill.PoisonII, exp: 0 },
			{ id: Skill.PoisonIII, exp: 0 },
			{ id: Skill.PoisonIV, exp: 0 },
		],
		level: 16,
		rewards: {
			expBase: 600,  // Level 16
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	bigCrab: {
		name: 'Big Crab',
		file: 217,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.139, max: 1.181 },
			sta: { min: 125, max: 125 },
			int: { min: 112, max: 112 },
			str: { min: 18, max: 18 },
			agi: { min: 76, max: 76 },
		},
		build: { sta: 4, int: 1, str: 1, agi: 2 },
		skills: [
			{ id: Skill.ProtectI, exp: 0 },
			{ id: Skill.ProtectII, exp: 0 },
			{ id: Skill.ProtectIII, exp: 0 },
			{ id: Skill.ProtectIV, exp: 0 },
		],
		level: 19,
		rewards: {
			expBase: 800,  // Level 19
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	glimmerFish: {
		name: 'Glimmer Fish',
		file: 217,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.144, max: 1.174 },
			sta: { min: 94, max: 94 },
			int: { min: 161, max: 161 },
			str: { min: 18, max: 18 },
			agi: { min: 145, max: 145 },
		},
		build: { sta: 1, int: 2, str: 1, agi: 3 },
		skills: [
			{ id: Skill.FrailtyI, exp: 0 },
			{ id: Skill.FrailtyII, exp: 0 },
			{ id: Skill.FrailtyIII, exp: 0 },
			{ id: Skill.FrailtyIV, exp: 0 },
		],
		level: 22,
		rewards: {
			expBase: 1200,  // Level 22
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	flyer: {
		name: 'Flyer',
		file: 203,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.123, max: 1.153 },
			sta: { min: 90, max: 90 },
			int: { min: 99, max: 99 },
			str: { min: 17, max: 17 },
			agi: { min: 256, max: 256 },
		},
		build: { sta: 2, int: 1, str: 1, agi: 5 },
		skills: [
			{ id: Skill.SpeedI, exp: 0 },
			{ id: Skill.SpeedII, exp: 0 },
			{ id: Skill.SpeedIII, exp: 0 },
			{ id: Skill.SpeedIV, exp: 0 },
		],
		level: 25,
		rewards: {
			expBase: 1600,  // Level 25
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	bubbleCrab: {
		name: 'Bubble Crab',
		file: 262,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.123, max: 1.153 },
			sta: { min: 90, max: 90 },
			int: { min: 99, max: 99 },
			str: { min: 17, max: 17 },
			agi: { min: 256, max: 256 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 28,
		rewards: {
			expBase: 2200,  // Level 28
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	bigFlyer: {
		name: 'Big Flyer',
		file: 203,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.123, max: 1.153 },
			sta: { min: 90, max: 90 },
			int: { min: 99, max: 99 },
			str: { min: 17, max: 17 },
			agi: { min: 256, max: 256 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 31,
		rewards: {
			expBase: 2800,  // Level 31
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	poisonpede: {
		name: 'Poisonpede',
		file: 202,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.153, max: 1.183 },
			sta: { min: 86, max: 86 },
			int: { min: 95, max: 95 },
			str: { min: 25, max: 25 },
			agi: { min: 103, max: 103 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 34,
		rewards: {
			expBase: 3500,  // Level 34
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	flyingFish: {
		name: 'Flying Fish',
		file: 217,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.144, max: 1.174 },
			sta: { min: 94, max: 94 },
			int: { min: 161, max: 161 },
			str: { min: 18, max: 18 },
			agi: { min: 145, max: 145 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 37,
		rewards: {
			expBase: 4500,  // Level 37
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	leopardWolf: {
		name: 'Leopard Wolf',
		file: 206,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.166, max: 1.196 },
			sta: { min: 94, max: 94 },
			int: { min: 94, max: 94 },
			str: { min: 24, max: 24 },
			agi: { min: 95, max: 95 },
		},
		build: { sta: 2, int: 1, str: 3, agi: 3 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 40,
		rewards: {
			expBase: 5500,  // Level 40
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	skeletal: {
		name: 'Skeletal',
		file: 211,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.131, max: 1.16 },
			sta: { min: 90, max: 90 },
			int: { min: 59, max: 59 },
			str: { min: 29, max: 29 },
			agi: { min: 42, max: 42 },
		},
		build: { sta: 2, int: 1, str: 4, agi: 1 },
		skills: [
			{ id: Skill.EnhanceI, exp: 0 },
			{ id: Skill.EnhanceII, exp: 0 },
			{ id: Skill.EnhanceIII, exp: 0 },
			{ id: Skill.EnhanceIV, exp: 0 },
		],
		level: 44,
		rewards: {
			expBase: 8000,  // Level 44
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	fogSpirit: {
		name: 'Fog Spirit',
		file: 215,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.155, max: 1.185 },
			sta: { min: 86, max: 86 },
			int: { min: 399, max: 399 },
			str: { min: 16, max: 16 },
			agi: { min: 152, max: 152 },
		},
		build: { sta: 1, int: 5, str: 1, agi: 5 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 47,
		rewards: {
			expBase: 25000,  // Level 47
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	mudraper: {
		name: 'Mudraper',
		file: 219,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.142, max: 1.173 },
			sta: { min: 158, max: 158 },
			int: { min: 212, max: 212 },
			str: { min: 19, max: 19 },
			agi: { min: 39, max: 39 },
		},
		build: { sta: 5, int: 3, str: 1, agi: 1 },
		skills: [
			{ id: Skill.IceI, exp: 0 },
			{ id: Skill.IceII, exp: 0 },
			{ id: Skill.IceIII, exp: 0 },
			{ id: Skill.IceIV, exp: 0 },
		],
		level: 50,
		rewards: {
			expBase: 32000,  // Level 50
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilSkeletal: {
		name: 'Evil Skeletal',
		file: 211,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.131, max: 1.16 },
			sta: { min: 90, max: 90 },
			int: { min: 59, max: 59 },
			str: { min: 29, max: 29 },
			agi: { min: 42, max: 42 },
		},
		build: { sta: 2, int: 1, str: 4, agi: 1 },
		skills: [
			{ id: Skill.EnhanceI, exp: 0 },
			{ id: Skill.EnhanceII, exp: 0 },
			{ id: Skill.EnhanceIII, exp: 0 },
			{ id: Skill.EnhanceIV, exp: 0 },
		],
		level: 54,
		rewards: {
			expBase: 42000,  // Level 54
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	spiritWolf: {
		name: 'Spirit Wolf',
		file: 207,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 130, max: 130 },
			int: { min: 286, max: 286 },
			str: { min: 49, max: 49 },
			agi: { min: 141, max: 141 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 58,
		rewards: {
			expBase: 57000,  // Level 58
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	giantslicer: {
		name: 'Giantslicer',
		file: 221,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.166, max: 1.199 },
			sta: { min: 148, max: 148 },
			int: { min: 268, max: 268 },
			str: { min: 21, max: 21 },
			agi: { min: 90, max: 90 },
		},
		build: { sta: 4, int: 4, str: 2, agi: 3 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 62,
		rewards: {
			expBase: 74000,  // Level 62
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	desertBandit: {
		name: 'Desert Bandit',
		file: 214,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.129, max: 1.159 },
			sta: { min: 118, max: 118 },
			int: { min: 70, max: 70 },
			str: { min: 18, max: 18 },
			agi: { min: 67, max: 67 },
		},
		build: { sta: 3, int: 1, str: 1, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 66,
		rewards: {
			expBase: 95000,  // Level 66
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	banditLeader: {
		name: 'Bandit Leader',
		file: 214,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.129, max: 1.159 },
			sta: { min: 118, max: 118 },
			int: { min: 70, max: 70 },
			str: { min: 18, max: 18 },
			agi: { min: 67, max: 67 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 70,
		rewards: {
			expBase: 120000,  // Level 70
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	lizardMan: {
		name: 'Lizard Man',
		file: 224,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.134, max: 1.164 },
			sta: { min: 88, max: 88 },
			int: { min: 112, max: 112 },
			str: { min: 18, max: 18 },
			agi: { min: 62, max: 62 },
		},
		build: { sta: 1, int: 2, str: 1, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 36,
		rewards: {
			expBase: 4200,  // Level 36
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	crazyBandit: {
		name: 'Crazy Bandit',
		file: 250,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.131, max: 1.161 },
			sta: { min: 101, max: 101 },
			int: { min: 117, max: 117 },
			str: { min: 19, max: 19 },
			agi: { min: 73, max: 73 },
		},
		build: { sta: 3, int: 2, str: 1, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 37,
		rewards: {
			expBase: 4500,  // Level 37
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	lycosa: {
		name: 'Lycosa',
		file: 225,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.162, max: 1.19 },
			sta: { min: 88, max: 88 },
			int: { min: 192, max: 192 },
			str: { min: 22, max: 22 },
			agi: { min: 94, max: 94 },
		},
		build: { sta: 4, int: 1, str: 1, agi: 2 },
		skills: [
			{ id: Skill.PoisonI, exp: 0 },
			{ id: Skill.PoisonII, exp: 0 },
			{ id: Skill.PoisonIII, exp: 0 },
			{ id: Skill.PoisonIV, exp: 0 },
		],
		level: 38,
		rewards: {
			expBase: 5000,  // Level 38
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	werewolf: {
		name: 'Werewolf',
		file: 208,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.138, max: 1.169 },
			sta: { min: 105, max: 105 },
			int: { min: 54, max: 54 },
			str: { min: 26, max: 26 },
			agi: { min: 75, max: 75 },
		},
		build: { sta: 3, int: 1, str: 4, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 39,
		rewards: {
			expBase: 5200,  // Level 39
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	bogNightmare: {
		name: 'Bog Nightmare',
		file: 253,
		species: Species.Dragon,
		statRates: {
			growthRate: { min: 1.171, max: 1.193 },
			sta: { min: 132, max: 132 },
			int: { min: 288, max: 288 },
			str: { min: 23, max: 23 },
			agi: { min: 82, max: 82 },
		},
		build: { sta: 4, int: 4, str: 3, agi: 3 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 40,
		rewards: {
			expBase: 5500,  // Level 40
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	crazyWerewolf: {
		name: 'Crazy Werewolf',
		file: 208,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.138, max: 1.169 },
			sta: { min: 105, max: 105 },
			int: { min: 54, max: 54 },
			str: { min: 26, max: 26 },
			agi: { min: 75, max: 75 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 41,
		rewards: {
			expBase: 6000,  // Level 41
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	appearOgrewalker: {
		name: 'Appear Ogrewalker',
		file: 252,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.164, max: 1.194 },
			sta: { min: 123, max: 123 },
			int: { min: 48, max: 48 },
			str: { min: 42, max: 42 },
			agi: { min: 60, max: 60 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 42,
		rewards: {
			expBase: 6500,  // Level 42
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	deadlySpider: {
		name: 'Deadly Spider',
		file: 227,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.162, max: 1.19 },
			sta: { min: 88, max: 88 },
			int: { min: 192, max: 192 },
			str: { min: 22, max: 22 },
			agi: { min: 94, max: 94 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 43,
		rewards: {
			expBase: 7000,  // Level 43
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	darkNightmare: {
		name: 'Dark Nightmare',
		file: 253,
		species: Species.Dragon,
		statRates: {
			growthRate: { min: 1.171, max: 1.193 },
			sta: { min: 132, max: 132 },
			int: { min: 288, max: 288 },
			str: { min: 23, max: 23 },
			agi: { min: 82, max: 82 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 44,
		rewards: {
			expBase: 7500,  // Level 44
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	appearHellGardener: {
		name: 'Appear Hell Gardener',
		file: 240,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.4, max: 1.4 },
			sta: { min: 161, max: 161 },
			int: { min: 309, max: 309 },
			str: { min: 48, max: 48 },
			agi: { min: 101, max: 101 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 67,
		rewards: {
			expBase: 100000,  // Level 67
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	riverBeast: {
		name: 'River Beast',
		file: 243,
		species: Species.Flying,
		statRates: {
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 175, max: 175 },
			int: { min: 287, max: 287 },
			str: { min: 44, max: 44 },
			agi: { min: 101, max: 101 },
		},
		build: { sta: 5, int: 3, str: 5, agi: 3 },
		skills: [
			{ id: Skill.ProtectI, exp: 0 },
			{ id: Skill.ProtectII, exp: 0 },
			{ id: Skill.ProtectIII, exp: 0 },
			{ id: Skill.ProtectIV, exp: 0 },
		],
		level: 68,
		rewards: {
			expBase: 107000,  // Level 68
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	hellSpirit: {
		name: 'Hell Spirit',
		file: 215,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.155, max: 1.185 },
			sta: { min: 86, max: 86 },
			int: { min: 399, max: 399 },
			str: { min: 16, max: 16 },
			agi: { min: 152, max: 152 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 69,
		rewards: {
			expBase: 114000,  // Level 69
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	stoneGiant: {
		name: 'Stone Giant',
		file: 229,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.191, max: 1.221 },
			sta: { min: 167, max: 167 },
			int: { min: 43, max: 43 },
			str: { min: 24, max: 24 },
			agi: { min: 15, max: 15 },
		},
		build: { sta: 5, int: 1, str: 3, agi: 1 },
		skills: [
			{ id: Skill.EnhanceI, exp: 0 },
			{ id: Skill.EnhanceII, exp: 0 },
			{ id: Skill.EnhanceIII, exp: 0 },
			{ id: Skill.EnhanceIV, exp: 0 },
		],
		level: 70,
		rewards: {
			expBase: 120000,  // Level 70
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	madGiant: {
		name: 'Mad Giant',
		file: 232,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.199, max: 1.219 },
			sta: { min: 178, max: 178 },
			int: { min: 38, max: 38 },
			str: { min: 27, max: 27 },
			agi: { min: 13, max: 13 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 71,
		rewards: {
			expBase: 128000,  // Level 71
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	demonDragon: {
		name: 'Demon Dragon',
		file: 245,
		species: Species.Dragon,
		statRates: {
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 175, max: 175 },
			int: { min: 286, max: 286 },
			str: { min: 39, max: 39 },
			agi: { min: 81, max: 81 },
		},
		build: { sta: 4, int: 4, str: 2, agi: 4 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 72,
		rewards: {
			expBase: 160000,  // Level 72
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	ghoulthrottler: {
		name: 'Ghoulthrottler',
		file: 213,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 175, max: 175 },
			int: { min: 286, max: 286 },
			str: { min: 39, max: 39 },
			agi: { min: 81, max: 81 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 72,
		rewards: {
			expBase: 160000,  // Level 72
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	blackDragon: {
		name: 'Black Dragon',
		file: 245,
		species: Species.Dragon,
		statRates: {
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 175, max: 175 },
			int: { min: 286, max: 286 },
			str: { min: 39, max: 39 },
			agi: { min: 81, max: 81 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 74,
		rewards: {
			expBase: 180000,  // Level 74
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	lizardMiner: {
		name: 'Lizard Miner',
		file: 224,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.132, max: 1.162 },
			sta: { min: 85, max: 85 },
			int: { min: 53, max: 53 },
			str: { min: 18, max: 18 },
			agi: { min: 80, max: 80 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 2 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 58,
		rewards: {
			expBase: 57000,  // Level 58
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	feralWolf: {
		name: 'Feral Wolf',
		file: 228,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.169, max: 1.199 },
			sta: { min: 156, max: 156 },
			int: { min: 66, max: 66 },
			str: { min: 31, max: 31 },
			agi: { min: 149, max: 149 },
		},
		build: { sta: 5, int: 1, str: 4, agi: 5 },
		skills: [
			{ id: Skill.EnhanceI, exp: 0 },
			{ id: Skill.EnhanceII, exp: 0 },
			{ id: Skill.EnhanceIII, exp: 0 },
			{ id: Skill.EnhanceIV, exp: 0 },
		],
		level: 59,
		rewards: {
			expBase: 74000,  // Level 59
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	seniorLevelMiner: {
		name: 'Senior Level Miner',
		file: 224,
		species: Species.Human,
		statRates: {
			growthRate: { min: 1.132, max: 1.162 },
			sta: { min: 85, max: 85 },
			int: { min: 53, max: 53 },
			str: { min: 18, max: 18 },
			agi: { min: 80, max: 80 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 60,
		rewards: {
			expBase: 95000,  // Level 60
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	auroraLion: {
		name: 'Aurora Lion',
		file: 226,
		species: Species.Special,
		statRates: {
			growthRate: { min: 1.17, max: 1.2 },
			sta: { min: 158, max: 158 },
			int: { min: 56, max: 56 },
			str: { min: 28, max: 28 },
			agi: { min: 66, max: 66 },
		},
		build: { sta: 4, int: 1, str: 4, agi: 3 },
		skills: [
			{ id: Skill.MultiShotI, exp: 0 },
			{ id: Skill.MultiShotII, exp: 0 },
			{ id: Skill.MultiShotIII, exp: 0 },
			{ id: Skill.MultiShotIV, exp: 0 },
		],
		level: 61,
		rewards: {
			expBase: 70000,  // Level 61
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	bigFoot: {
		name: 'Big Foot',
		file: 232,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.199, max: 1.219 },
			sta: { min: 178, max: 178 },
			int: { min: 38, max: 38 },
			str: { min: 27, max: 27 },
			agi: { min: 13, max: 13 },
		},
		build: { sta: 6, int: 1, str: 4, agi: 1 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 62,
		rewards: {
			expBase: 74000,  // Level 62
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	ghostWarrior: {
		name: 'Ghost Warrior',
		file: 201,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.17, max: 1.2 },
			sta: { min: 93, max: 93 },
			int: { min: 43, max: 43 },
			str: { min: 50, max: 50 },
			agi: { min: 55, max: 55 },
		},
		build: { sta: 2, int: 1, str: 5, agi: 2 },
		skills: [
			{ id: Skill.EnhanceI, exp: 0 },
			{ id: Skill.EnhanceII, exp: 0 },
			{ id: Skill.EnhanceIII, exp: 0 },
			{ id: Skill.EnhanceIV, exp: 0 },
		],
		level: 63,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	fireDevil: {
		name: 'Fire Devil',
		file: 233, //TODO
		species: Species.Flying, //TODO
		statRates: {
			//TODO
			growthRate: { min: 1.188, max: 1.218 },
			sta: { min: 102, max: 102 },
			int: { min: 368, max: 368 },
			str: { min: 28, max: 28 },
			agi: { min: 78, max: 78 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 64,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	darkGiant: {
		name: 'Dark Giant',
		file: 232,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.199, max: 1.219 },
			sta: { min: 178, max: 178 },
			int: { min: 38, max: 38 },
			str: { min: 27, max: 27 },
			agi: { min: 13, max: 13 },
		},
		build: { sta: 5, int: 1, str: 4, agi: 1 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 65,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	mummy: {
		name: 'Mummy',
		file: 209,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.148, max: 1.178 },
			sta: { min: 136, max: 113678 },
			int: { min: 36, max: 36 },
			str: { min: 27, max: 27 },
			agi: { min: 20, max: 20 },
		},
		build: { sta: 4, int: 2, str: 4, agi: 1 },
		skills: [
			{ id: Skill.ProtectI, exp: 0 },
			{ id: Skill.ProtectII, exp: 0 },
			{ id: Skill.ProtectIII, exp: 0 },
			{ id: Skill.ProtectIV, exp: 0 },
		],
		level: 76,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	evilMudraper: {
		name: 'Evil Mudraper',
		file: 219,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.142, max: 1.173 },
			sta: { min: 158, max: 158 },
			int: { min: 212, max: 212 },
			str: { min: 19, max: 19 },
			agi: { min: 39, max: 39 },
		},
		build: { sta: 5, int: 3, str: 1, agi: 1 },
		level: 77,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	ancientMummy: {
		name: 'Ancient Mummy',
		file: 209, //TODO
		species: Species.Undead, //TODO
		statRates: {
			//TODO
			growthRate: { min: 1.148, max: 1.178 },
			sta: { min: 136, max: 113678 },
			int: { min: 36, max: 36 },
			str: { min: 27, max: 27 },
			agi: { min: 20, max: 20 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 78,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	wickedSpirit: {
		name: 'Wicked Spirit',
		file: 215,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 130, max: 130 },
			int: { min: 449, max: 449 },
			str: { min: 23, max: 23 },
			agi: { min: 41, max: 41 },
		},
		build: { sta: 3, int: 5, str: 2, agi: 1 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 79,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	demonPunisher: {
		name: 'Demon Punisher',
		file: 218,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.205, max: 1.225 },
			sta: { min: 97, max: 97 },
			int: { min: 429, max: 429 },
			str: { min: 17, max: 17 },
			agi: { min: 120, max: 120 },
		},
		build: { sta: 2, int: 5, str: 1, agi: 4 },
		skills: [
			{ id: Skill.EvilI, exp: 0 },
			{ id: Skill.EvilII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.EvilIV, exp: 0 },
		],
		level: 81,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	demonWarrior: {
		name: 'Demon Warrior',
		file: 201, //TODO
		species: Species.Demon, //TODO
		statRates: {
			//TODO
			growthRate: { min: 1.17, max: 1.2 },
			sta: { min: 93, max: 93 },
			int: { min: 43, max: 43 },
			str: { min: 50, max: 50 },
			agi: { min: 55, max: 55 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 82,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	ghoul: {
		name: 'Ghoul',
		file: 220,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.205, max: 1.225 },
			sta: { min: 96, max: 96 },
			int: { min: 465, max: 465 },
			str: { min: 17, max: 17 },
			agi: { min: 134, max: 134 },
		},
		build: { sta: 2, int: 5, str: 1, agi: 4 },
		skills: [
			{ id: Skill.FireI, exp: 0 },
			{ id: Skill.FireII, exp: 0 },
			{ id: Skill.FireIII, exp: 0 },
			{ id: Skill.FireIV, exp: 0 },
		],
		level: 83,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	crazyGhoul: {
		name: 'Crazy Ghoul',
		file: 220, //TODO
		species: Species.Demon, //TODO
		statRates: {
			//TODO
			growthRate: { min: 1.205, max: 1.225 },
			sta: { min: 96, max: 96 },
			int: { min: 465, max: 465 },
			str: { min: 17, max: 17 },
			agi: { min: 134, max: 134 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 84,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	chaosDevil: {
		name: 'Chaos Devil',
		file: 213,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.3, max: 1.3 },
			sta: { min: 176, max: 176 },
			int: { min: 449, max: 449 },
			str: { min: 23, max: 23 },
			agi: { min: 11, max: 11 },
		},
		build: { sta: 4, int: 5, str: 2, agi: 1 },
		skills: [
			{ id: Skill.FireI, exp: 0 },
			{ id: Skill.IceII, exp: 0 },
			{ id: Skill.EvilIII, exp: 0 },
			{ id: Skill.FlashIV, exp: 0 },
		],
		level: 85,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	appearPhoenix: {
		name: 'Appear Phoenix',
		file: 234, //TODO
		species: Species.Dragon, //TODO
		statRates: {
			//TODO
			growthRate: { min: 1.178, max: 1.201 },
			sta: { min: 83, max: 83 },
			int: { min: 456, max: 456 },
			str: { min: 19, max: 19 },
			agi: { min: 197, max: 197 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 }, //TODO
		level: 17,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	hellGardener: {
		name: 'Hell Gardener',
		file: 240,
		species: Species.Undead,
		statRates: {
			growthRate: { min: 1.4, max: 1.4 },
			sta: { min: 161, max: 161 },
			int: { min: 309, max: 309 },
			str: { min: 48, max: 48 },
			agi: { min: 101, max: 101 },
		},
		build: { sta: 4, int: 4, str: 5, agi: 5 },
		skills: [
			{ id: Skill.SpeedI, exp: 0 },
			{ id: Skill.SpeedII, exp: 0 },
			{ id: Skill.EnhanceI, exp: 0 },
			{ id: Skill.EnhanceII, exp: 0 },
		],
		level: 67,
		rewards: {
			//TODO
			expBase: 3,
			goldBase: 2,
		},
		onMonsterPlayerFightWin: [],
	},
	drowcrusherBoss: {
		name: 'Drowcrusher',
		file: 245,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1, max: 1 },
			sta: { min: 12000, max: 12000 },
			int: { min: 500, max: 500 },
			str: { min: 2000, max: 2000 },
			agi: { min: 500, max: 500 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 50,
		skills: [{ id: Skill.FlashII, exp: 0 }],
		rewards: {
			expBase: 0,
			goldBase: 0,
		},
	},
	ghostWarriorElite: {
		name: 'Ghostwarrior',
		file: 201,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1, max: 1 },
			sta: { min: 3200, max: 3200 },
			int: { min: 200, max: 200 },
			str: { min: 135, max: 135 },
			agi: { min: 300, max: 300 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 50,
		skills: [{ id: Skill.EnhanceII, exp: 0 }],
		rewards: {
			expBase: 0,
			goldBase: 0,
		},
	},
	centaurRaider: {
		name: 'Centaur',
		file: 255,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1, max: 1 },
			sta: { min: 1600, max: 1600 },
			int: { min: 200, max: 200 },
			str: { min: 100, max: 100 },
			agi: { min: 300, max: 300 },
		},
		build: { sta: 1, int: 1, str: 1, agi: 1 },
		level: 50,
		skills: [{ id: Skill.MultiShotII, exp: 0 }],
		rewards: {
			expBase: 0,
			goldBase: 0,
		},
	},
	felswornPet: {
		name: 'Felsworn Pet',
		file: 231,
		species: Species.Demon,
		statRates: {
			growthRate: { min: 1.25, max: 1.25 },
			sta: { min: 200, max: 200 },
			int: { min: 50, max: 50 },
			str: { min: 50, max: 50 },
			agi: { min: 50, max: 50 },
		},
		build: { sta: 5, int: 1, str: 1, agi: 1 },
		level: 20,
		skills: [
			{ id: Skill.FrailtyI, exp: 0 },
			{ id: Skill.FrailtyII, exp: 0 },
			{ id: Skill.FrailtyIII, exp: 0 },
			{ id: Skill.FrailtyIV, exp: 0 },
		],
		rewards: {
			expBase: 5000,
			goldBase: 1000,
		},
	},
};
