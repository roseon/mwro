import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const BurialNpcsData: NpcJson[] = [
	{
		id: 0x80000231,
		name: 'Dark Priest',
		file: 120,
		map: MapID.Burial4,
		point: { x: 416, y: 328 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000232,
		name: 'Skeletor',
		file: 211,
		map: MapID.Burial3,
		point: { x: 1120, y: 3120 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000233,
		name: 'Agony Spirit',
		file: 120,
		map: MapID.Burial2,
		point: { x: 1536, y: 2184 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000234,
		name: 'Tour Agent',
		file: 104,
		map: MapID.Burial2,
		point: { x: 1600, y: 1000 },
		direction: Direction.SouthWest,
	},
];
