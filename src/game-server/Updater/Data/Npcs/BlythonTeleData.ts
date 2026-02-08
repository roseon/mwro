import { NpcId } from '../../../Data/NpcId';
import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const blythonTeleData: NpcJson = {
	id: NpcId.BlythonTele,
	name: 'Teleporter',
	file: 120,
	map: MapID.Blython,
	point: { x: 1365, y: 5180 },
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
				text: '#GTest Shop#E',
				action: { type: 'template', template: 'testShop' },
			},
			{
				text: '#GQuest?#E',
				condition: {
					type: 'quest',
					quest: 1,
				},
				action: {
					type: 'npcSay',
					message: "This is the end of the quest, wasn't that exciting? #51",
					onClose: {
						type: 'quest',
						remove: 1,
					},
				},
			},
			{ text: '#YClose#E' },
		],
	},
};
