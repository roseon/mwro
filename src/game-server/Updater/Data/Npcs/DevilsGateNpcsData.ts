import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const DevilsGateNpcsData: NpcJson[] = [
	{
		id: 0x80000155,
		name: 'Short Tom',
		file: 135,
		map: MapID.DevilsGate,
		point: { x: 1600, y: 1400 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000156,
		name: 'Cave Clayman',
		file: 238,
		map: MapID.DevilsGate,
		point: { x: 3920, y: 2200 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000158,
		name: 'Bonepoker',
		file: 242,
		map: MapID.DevilsGate,
		point: { x: 800, y: 1840 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000352,
		name: 'Narrow Mine',
		file: 144,
		map: MapID.DevilsGate,
		point: { x: 280, y: 2995 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000353,
		},
	},
];
