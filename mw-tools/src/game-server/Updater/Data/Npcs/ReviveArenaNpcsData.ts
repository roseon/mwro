import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const ReviveArenaNpcsData: NpcJson[] = [
	{
		id: 0x80000107,
		name: 'Bat Beast',
		file: 203,
		map: MapID.ReviveArena,
		point: { x: 1600, y: 1160 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000108,
		name: 'Disciple',
		file: 135,
		map: MapID.ReviveArena,
		point: { x: 240, y: 688 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message: 'Are you collecting mokka?',
			options: [
				{
					text: '#gYes I got Mokkas#e',
					action: { type: 'template', template: 'discipleSkillTrade' },
				},
				{
					text: '#gNo, what is that?#e',
					action: {
						type: 'npcSay',
						message: 'It is a special item that can help you improve your skills.',
					},
				},
			],
		},
	},
	{
		id: 0x80000109,
		name: 'Mokka',
		file: 126,
		map: MapID.ReviveArena,
		point: { x: 384, y: 680 },
		direction: Direction.SouthWest,
	},
];
