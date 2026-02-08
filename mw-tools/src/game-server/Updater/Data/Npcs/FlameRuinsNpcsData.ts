import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const FlameRuinsNpcsData: NpcJson[] = [
	{
		id: 0x80000148,
		name: 'Kelina',
		file: 123,
		map: MapID.FlameRuins,
		point: { x: 576, y: 3416 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000149,
		name: 'Teleporter',
		file: 159,
		map: MapID.FlameRuins,
		point: { x: 608, y: 184 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000150,
		name: 'Guard Chief',
		file: 1,
		map: MapID.FlameRuins,
		point: { x: 672, y: 3456 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000358,
		name: 'Vast Mine',
		file: 144,
		map: MapID.FlameRuins,
		point: { x: 4145, y: 385 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000359,
		},
	},
];
