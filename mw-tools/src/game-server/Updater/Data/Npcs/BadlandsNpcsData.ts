import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const badlandsNpcsData: NpcJson[] = [
	{
		id: 0x80000332,
		name: 'Cursed Mage',
		file: 5,
		map: MapID.Badlands,
		point: { x: 2640, y: 2920 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000333,
		name: 'Teleporter',
		file: 120,
		map: MapID.Badlands,
		point: { x: 320, y: 3752 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000340,
		name: 'Vast Mine',
		file: 144,
		map: MapID.Badlands,
		point: { x: 4752, y: 519 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000342,
		},
	},
];
