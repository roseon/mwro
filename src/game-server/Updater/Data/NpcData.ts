import { type NpcJson, NpcType } from '../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../Enums/Direction';
import { blythonTeleData } from './Npcs/BlythonTeleData';
import { BlythonNpcsData } from './Npcs/BlythonNpcsData';
import { descityTeleData } from './Npcs/DescityTeleData';
import { DesCityNpcsData } from './Npcs/DesCityNpcsData';
import { testQuestNpcsData } from './Npcs/TestQuestNpcsData';
import { woodTeleData } from './Npcs/WoodTeleData';
import { WoodNpcsData } from './Npcs/WoodNpcsData';
import { DemonSquareNpcsData } from './Npcs/DemonSquareNpcsData';
import { BurialNpcsData } from './Npcs/BurialNpcsData';
import { DevilsGateNpcsData } from './Npcs/DevilsGateNpcsData';
import { FlameRuinsNpcsData } from './Npcs/FlameRuinsNpcsData';
import { FlamingorNpcsData } from './Npcs/FlamingorNpcsData';
import { OutcCityNpcsData } from './Npcs/OutcCityNpcsData';
import { PrisonNpcsData } from './Npcs/PrisonNpcsData';
import { ReviveArenaNpcsData } from './Npcs/ReviveArenaNpcsData';
import { SewerNpcsData } from './Npcs/SewerNpcsData';
import { SkyPassNpcsData } from './Npcs/SkyPassNpcsData';
import { SunsetPlainNpcsData } from './Npcs/SunsetPlainNpcsData';
import { TreeofLifeNpcsData } from './Npcs/TreeofLifeNpcsData';
import { WastelandNpcsData } from './Npcs/WastelandNpcsData';
import { EvilLairNpcsData } from './Npcs/EvilLairNpcsData';
import { ashesPitsNpcsData } from './Npcs/AshesPitsNpcsData';
import { guildHQNpcsData } from './Npcs/GuildHQNpcsData';
import { minesNpcsData } from './Npcs/MinesNpcsData';
import { badlandsNpcsData } from './Npcs/BadlandsNpcsData';
import { boneDesertNpcsData } from './Npcs/BoneDesertNpcsData';
import { cursedAbyssNpcsData } from './Npcs/CursedAbyssNpcsData';
import { petTemplates } from '../../Data/PetTemplates';
import { woodShopData } from './Npcs/WoodShopData';
//----showcase
import { ShowCaseNpcsData } from './Npcs/ShowCase';
import { MapID } from '../../Enums/MapID';
//---

export const npcDataList: NpcJson[] = [
	...ShowCaseNpcsData,
	woodTeleData,
	...WoodNpcsData,
	blythonTeleData,
	...BlythonNpcsData,
	descityTeleData,
	...testQuestNpcsData,
	...BlythonNpcsData,
	...DesCityNpcsData,
	...DemonSquareNpcsData,
	...BurialNpcsData,
	...DevilsGateNpcsData,
	...FlameRuinsNpcsData,
	...FlamingorNpcsData,
	...OutcCityNpcsData,
	...PrisonNpcsData,
	...ReviveArenaNpcsData,
	...SewerNpcsData,
	...SkyPassNpcsData,
	...SunsetPlainNpcsData,
	...TreeofLifeNpcsData,
	...WastelandNpcsData,
	...EvilLairNpcsData,
	...ashesPitsNpcsData,
	...guildHQNpcsData,
	...minesNpcsData,
	...badlandsNpcsData,
	...boneDesertNpcsData,
	...cursedAbyssNpcsData,
	...woodShopData,
	{
		id: 0x80000003,
		name: 'Exp Test',
		file: 130,
		direction: Direction.SouthEast,
		map: MapID.Woodlingor,
		point: { x: 7550, y: 2050 },
		action: {
			type: 'npcSay',
			options: [
				{
					text: '#GPlayer Exp#E',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: '#GPet Exp#E',
					action: { type: 'exp', amount: 500, pet: true },
				},
				{
					text: '#GShowCase #18#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x88800001,
					},
				},
				{
					text: '#GTree of Life 3 (0 gold)#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000075,
					},
				},
				{
					text: '#GGuild HQ (0 gold)#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000139,
					},
				},
				{
					text: '#GFlame Ruins Mine#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000358,
					},
				},
				{
					text: '#GCursed Abyss Mine#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000355,
					},
				},
				{
					text: '#GBone Vast Mine#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000344,
					},
				},
				{
					text: '#GAdd Pet#E',
					action: {
						type: 'npcSay',
						options: [
							{
								text: '#GCapilla#E',
								action: { type: 'addPet', pet: 'capilla' },
							},
							{
								text: '#GAnt Eater#E',
								action: { type: 'addPet', pet: 'antEater' },
							},
							{
								text: '#GOcean Loong#E',
								action: { type: 'addPet', pet: 'oceanLoong' },
							},
							{
								text: '#GBerserker#E',
								action: { type: 'addPet', pet: 'berserker' },
							},
							{
								text: '#GChinchilla Fire#E',
								action: {
									type: 'addPet',
									pet: 'chinchillaFire',
								},
							},
							{
								text: '#GHoly Dragon#E',
								action: {
									type: 'addPet',
									pet: 'holyDragon',
								},
							},
							{
								text: '#GSanta Clause#E',
								action: {
									type: 'addPet',
									pet: 'santaClaus',
								},
							},
							{
								text: '#GSanta Princess#E',
								action: {
									type: 'addPet',
									pet: 'santaPrincess',
								},
							},
							{
								text: '#GStone Tortoise#E',
								action: {
									type: 'addPet',
									pet: 'stoneTortoise',
								},
							},
							{
								text: '#GWicked Spirit#E',
								action: {
									type: 'addPet',
									pet: 'wickedSpirit',
								},
							},
						],
					},
				},
				{
					text: '#GTest Fight#E',
					action: { type: 'template', template: 'testFight' },
				},
				{ text: '#YClose#E' },
			],
		},
	},
	{
		id: 0x88800001,
		name: 'ShowCase NPC',
		file: 130,
		direction: Direction.SouthWest,
		map: MapID.ShowCase,
		point: { x: 1136, y: 960 },
		action: {
			type: 'npcSay',
			message: 'Want to go back? #18',
			options: [
				{
					text: '#GWoodlingor (0 gold)#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000003,
					},
				},
				{ text: '#YClose#E' },
			],
		},
	},
	{
		id: 0x88800002,
		name: 'Chest test',
		file: 136,
		map: MapID.Woodlingor,
		point: { x: 7936, y: 2568 },
		direction: Direction.SouthWest,
		spawnByDefault: false,
		spawnTime: '21:02',
		action: {
			type: 'array',
			actions: [
				{
					type: 'gold',
					amount: 1000,
				},
				{
					type: 'addTitle',
					titleId: 3,
				},
			],
		},
	},
	{
		id: 0x88800002,
		name: 'Item Spawner',
		file: 136,
		map: MapID.Woodlingor,
		point: { x: 7472, y: 2072 },
		direction: Direction.SouthWest,
		//spawnByDefault: false,
		//spawnTime: '21:02',
		action: {
			type: 'prompt',
			message: 'Enter an item ID to receive that item:',
			onResponse: {
				type: 'array',
				actions: [
					{
						type: 'npcSay',
						message: 'Please enter a valid number.',
						condition: {
							type: 'and',
							conditions: [
								{ type: 'promptResponse' },
								{
									type: 'template',
									template: 'isValidNumber',
									params: { text: '${promptText}' },
									not: true,
								},
							],
						},
					},
					{
						type: 'npcSay',
						message: 'That item ID does not exist!',
						condition: {
							type: 'and',
							conditions: [
								{ type: 'promptResponse' },
								{
									type: 'template',
									template: 'isValidNumber',
									params: { text: '${promptText}' },
								},
								{
									type: 'template',
									template: 'isValidItemId',
									params: { text: '${promptText}' },
									not: true,
								},
							],
						},
					},
					{
						type: 'addItem',
						baseItemId: '${promptText}',
						amount: 1,
						condition: {
							type: 'and',
							conditions: [
								{ type: 'promptResponse' },
								{
									type: 'template',
									template: 'isValidItemId',
									params: { text: '${promptText}' },
								},
							],
						},
					},
				],
			},
		},
	},
	{
		id: 0x88800003,
		name: 'Gem Applier',
		file: 136,
		map: MapID.Woodlingor,
		point: { x: 7900, y: 2500 },
		direction: Direction.SouthWest,
		type: NpcType.Gem,
	},
	{
		id: 0x88800144,
		name: 'Gem Converter',
		file: 136,
		map: MapID.Woodlingor,
		point: { x: 8000, y: 2500 },
		direction: Direction.SouthWest,
		type: NpcType.GemConverter,
	},
];
