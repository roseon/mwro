import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const TreeofLifeNpcsData: NpcJson[] = [
	{
		id: 0x80000073,
		name: 'Teleporter',
		file: 120,
		map: MapID.TreeofLife4,
		point: { x: 208, y: 2544 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Where would you like to go? #46',
			options: [
				{
					text: '#Glife Tree 3 (0 gold)#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000075,
					},
				},
				{
					text: '#GBack to Woodlingor (0 gold)#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000001,
					},
				},
				{ text: '#YClose#E' },
			],
		},
	},
	{
		id: 0x80000074,
		name: 'Blood Reaper',
		file: 206,
		map: MapID.TreeofLife3,
		point: { x: 2448, y: 1520 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000075,
		name: 'Teleporter',
		file: 120,
		map: MapID.TreeofLife3,
		point: { x: 3792, y: 368 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Where would you like to go? #46',
			options: [
				{
					text: '#GLife Tree 4 (0 gold)#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000073,
					},
				},
				{
					text: '#GBack to Woodlingor (0 gold)#E',
					action: {
						type: 'teleport',
						targetNpcId: 0x80000001,
					},
				},
				{ text: '#YClose#E' },
			],
		},
	},
	{
		id: 0x80000076,
		name: 'Howling Beast',
		file: 228,
		map: MapID.TreeofLife,
		point: { x: 1920, y: 1520 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000078,
		name: 'Nepenthes',
		file: 159,
		map: MapID.TreeofLife,
		point: { x: 464, y: 256 },
		direction: Direction.SouthWest,
	},
];
