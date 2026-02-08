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
import { CrabPitNpcsData } from './Npcs/CrabPitNpcsData';
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
	...CrabPitNpcsData,
	{
		id: 0x80000003,
		name: 'Pet Market',
		file: 130,
		direction: Direction.SouthEast,
		map: MapID.Woodlingor,
		point: { x: 7550, y: 2050 },
		action: {
			type: 'npcSay',
			options: [
				{
					text: '#GPlayer Exp#E',
					action: { type: 'exp', amount: 100000 },
				},
				{
					text: '#GPet Exp#E',
					action: { type: 'exp', amount: 50000, pet: true },
				},
				{
					text: '#GAdd Pet#E',
					action: { type: 'template', template: 'addPets' },
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
									not: true,
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
