import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const WastelandNpcsData: NpcJson[] = [
	{
		id: 0x80000072,
		name: 'Teleporter',
		file: 120,
		map: MapID.Wasteland,
		point: { x: 3392, y: 2744 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000114,
		name: 'Lion Dragon',
		file: 247,
		map: MapID.Wasteland1,
		point: { x: 1920, y: 1440 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000143,
		name: 'Tour Agent',
		file: 104,
		map: MapID.Wasteland1,
		point: { x: 2544, y: 1712 },
		direction: Direction.SouthWest,
	},
];
