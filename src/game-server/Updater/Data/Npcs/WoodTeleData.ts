import { NpcId } from '../../../Data/NpcId';
import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const woodTeleData: NpcJson = {
	id: NpcId.WoodTele,
	name: 'Teleporter',
	file: 120,
	map: MapID.Woodlingor,
	point: { x: 7808, y: 2110 },
	direction: Direction.SouthWest,
	action: {
		type: 'npcSay',
		message: 'Where would you like to go? #46',
		options: [
			{
				text: '#GBlython (0 gold)#E',
				action: {
					type: 'teleport',
					targetNpcId: NpcId.BlythonTele,
				},
			},
			{
				text: '#GDesert City (0 gold)#E',
				action: {
					type: 'teleport',
					targetNpcId: NpcId.DescityTele,
				},
			},
			{
				text: '#GDemon Square (0 gold)#E',
				action: {
					type: 'teleport',
					targetNpcId: 0x80000224,
				},
			},
			{
				text: '#GQuest?#E',
				condition: {
					type: 'quest',
					not: true,
					quest: 1,
				},
				action: {
					type: 'quest',
					add: { quest: 1 },
				},
			},
			{ text: '#YClose#E' },
		],
	},
};
