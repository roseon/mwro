import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const OutcCityNpcsData: NpcJson[] = [
	{
		id: 0x80000116,
		name: 'Prince Zenith',
		file: 5,
		map: MapID.OutcastCity,
		point: { x: 2080, y: 2960 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000117,
		name: 'Tour Agent',
		file: 104,
		map: MapID.OutcastCity,
		point: { x: 2160, y: 3280 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000118,
		name: 'Borg Giant',
		file: 7,
		map: MapID.OutcastCity,
		point: { x: 2480, y: 2880 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000119,
		name: 'Dark Knight',
		file: 1,
		map: MapID.OutcastCity,
		point: { x: 2480, y: 3080 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000120,
		name: 'Worn General',
		file: 3,
		map: MapID.OutcastCity,
		point: { x: 2496, y: 2640 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000121,
		name: 'Princess Agony',
		file: 2,
		map: MapID.OutcastCity,
		point: { x: 2976, y: 2832 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000122,
		name: 'Skeletar',
		file: 211,
		map: MapID.OutcastCity,
		point: { x: 3040, y: 1600 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000339,
		name: 'Narrow Mine',
		file: 144,
		map: MapID.OutcastCity,
		point: { x: 3888, y: 680 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000127,
		},
	},
];
