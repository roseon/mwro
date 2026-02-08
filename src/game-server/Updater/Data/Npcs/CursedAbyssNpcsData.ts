import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const cursedAbyssNpcsData: NpcJson[] = [
	{
		id: 0x80000355,
		name: 'Narrow Mine',
		file: 144,
		map: MapID.CursedAbyss,
		point: { x: 6030, y: 3224 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000356,
		},
	},
];
