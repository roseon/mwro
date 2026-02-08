import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const FlamingorNpcsData: NpcJson[] = [
	{
		id: 0x80000144,
		name: 'Firetroy',
		file: 233,
		map: MapID.Flamingor,
		point: { x: 1040, y: 2880 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000145,
		name: 'Flower Witch',
		file: 223,
		map: MapID.Flamingor,
		point: { x: 1264, y: 1280 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000146,
		name: 'Flame Beast',
		file: 235,
		map: MapID.Flamingor,
		point: { x: 2240, y: 3600 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000147,
		name: 'Peter',
		file: 121,
		map: MapID.Flamingor,
		point: { x: 4048, y: 672 },
		direction: Direction.SouthWest,
	},
];
