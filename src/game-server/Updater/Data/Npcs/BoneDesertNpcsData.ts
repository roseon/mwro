import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const boneDesertNpcsData: NpcJson[] = [
	{
		id: 0x80000343,
		name: 'Narrow Mine',
		file: 144,
		map: MapID.BoneDesert,
		point: { x: 1191, y: 775 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000346,
		},
	},
	{
		id: 0x80000344,
		name: 'Vast Mine',
		file: 144,
		map: MapID.BoneDesert,
		point: { x: 5056, y: 2856 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000348,
		},
	},
];
