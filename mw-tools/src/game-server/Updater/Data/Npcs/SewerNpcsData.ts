import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const SewerNpcsData: NpcJson[] = [
	{
		id: 0x80000106,
		name: 'Tour Agent',
		file: 104,
		map: MapID.Sewer2,
		point: { x: 400, y: 560 },
		direction: Direction.SouthWest,
	},
];
