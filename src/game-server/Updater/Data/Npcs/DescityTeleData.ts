import { NpcId } from '../../../Data/NpcId';
import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const descityTeleData: NpcJson = {
	id: NpcId.DescityTele,
	name: 'Teleporter',
	file: 120,
	map: MapID.DesertCity,
	point: { x: 4915, y: 3440 },
	direction: Direction.SouthEast,
	action: {
		type: 'npcSay',
		message: 'Where would you like to go? #46',
		options: [
			{
				text: '#GWoodlingor (0 gold)#E',
				action: {
					type: 'teleport',
					targetNpcId: NpcId.WoodTele,
				},
			},
			{
				text: '#GBlython (0 gold)#E',
				action: {
					type: 'teleport',
					targetNpcId: NpcId.BlythonTele,
				},
			},
			{ text: '#YClose#E' },
		],
	},
};
