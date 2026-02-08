import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const ashesPitsNpcsData: NpcJson[] = [
	{
		id: 0x80000334,
		name: 'Dark Shadow',
		file: 212,
		map: MapID.AshesPits4,
		point: { x: 4000, y: 240 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000335,
		name: 'Sorceror Hades',
		file: 248,
		map: MapID.AshesPits3,
		point: { x: 656, y: 1496 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000336,
		name: 'Tour Agent',
		file: 104,
		map: MapID.AshesPits2,
		point: { x: 3760, y: 2880 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000337,
		name: 'Teleporter',
		file: 120,
		map: MapID.AshesPits1,
		point: { x: 464, y: 512 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
];
