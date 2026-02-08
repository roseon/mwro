import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const PrisonNpcsData: NpcJson[] = [
	{
		id: 0x80000110,
		name: 'Prison Guard',
		file: 126,
		map: MapID.DesertCityPrison,
		point: { x: 1280, y: 2224 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000111,
		name: 'Prison Guard',
		file: 126,
		map: MapID.DesertCityPrison,
		point: { x: 1280, y: 2224 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000113,
		name: 'Chief Warden',
		file: 121,
		map: MapID.DesertCityPrison,
		point: { x: 1440, y: 208 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000115,
		name: 'Chief Warden',
		file: 121,
		map: MapID.DesertCityPrison,
		point: { x: 1440, y: 208 },
		direction: Direction.SouthWest,
	},
];
