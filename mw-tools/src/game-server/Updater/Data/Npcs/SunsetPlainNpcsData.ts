import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const SunsetPlainNpcsData: NpcJson[] = [
	{
		id: 0x80000079,
		name: 'Fistscarer',
		file: 212,
		map: MapID.SunsetPlain,
		point: { x: 1600, y: 1520 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000080,
		name: 'Hendel',
		file: 113,
		map: MapID.SunsetPlain,
		point: { x: 1952, y: 2800 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000081,
		name: 'Soldier Laura',
		file: 108,
		map: MapID.SunsetPlain,
		point: { x: 3200, y: 2400 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000082,
		name: 'Existent',
		file: 239,
		map: MapID.SunsetPlain,
		point: { x: 4432, y: 2920 },
		direction: Direction.SouthWest,
	},
];
