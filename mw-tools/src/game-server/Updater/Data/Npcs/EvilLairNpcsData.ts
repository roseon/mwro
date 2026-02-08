import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const EvilLairNpcsData: NpcJson[] = [
	{
		id: 0x80000151,
		name: 'Eyebasher',
		file: 244,
		map: MapID.EvilLair2,
		point: { x: 1040, y: 880 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000152,
		name: 'Lohan',
		file: 107,
		map: MapID.EvilLair2,
		point: { x: 1360, y: 1880 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000153,
		name: 'Pet Breeder',
		file: 113,
		map: MapID.EvilLair1,
		point: { x: 3920, y: 3160 },
		direction: Direction.SouthWest,
	},
];
