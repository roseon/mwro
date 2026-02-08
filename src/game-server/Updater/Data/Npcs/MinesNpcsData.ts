import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const minesNpcsData: NpcJson[] = [
	//Desert City Mine
	{
		id: 0x80000123,
		name: 'Mine Manager',
		file: 129,
		map: MapID.DesertCityNarrowMine,
		point: { x: 1312, y: 376 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000159,
		},
	},
	{
		id: 0x80000125,
		name: 'Mine Merchant',
		file: 102,
		map: MapID.DesertCityNarrowMine,
		point: { x: 1488, y: 368 },
		direction: Direction.SouthWest,
	},
	//--

	//Outcast City Mine
	{
		id: 0x80000127,
		name: 'Mine Manager',
		file: 129,
		map: MapID.OutcastCityMine,
		point: { x: 1312, y: 376 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000339,
		},
	},
	{
		id: 0x80000126,
		name: 'Mine Merchant',
		file: 102,
		map: MapID.OutcastCityMine,
		point: { x: 1488, y: 368 },
		direction: Direction.SouthWest,
	},
	//--

	//Badlands Mine
	{
		id: 0x80000341,
		name: 'Mine Merchant',
		file: 102,
		map: MapID.BadlandsVastMine,
		point: { x: 4224, y: 592 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000342,
		name: 'Mine Manager',
		file: 129,
		map: MapID.BadlandsVastMine,
		point: { x: 3968, y: 464 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000340,
		},
	},
	//--

	//Bone Desert Narrow Mine
	{
		id: 0x80000346,
		name: 'Mine Manager',
		file: 129,
		map: MapID.BoneDesertNarrowMine,
		point: { x: 1312, y: 376 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000343,
		},
	},
	{
		id: 0x80000345,
		name: 'Mine Merchant',
		file: 102,
		map: MapID.BoneDesertNarrowMine,
		point: { x: 1488, y: 368 },
		direction: Direction.SouthWest,
	},
	//--

	//Bone Desert Vast Mine
	{
		id: 0x80000347,
		name: 'Mine Merchant',
		file: 102,
		map: MapID.BoneDesertVastMine,
		point: { x: 4224, y: 592 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000348,
		name: 'Mine Manager',
		file: 129,
		map: MapID.BoneDesertVastMine,
		point: { x: 3968, y: 464 },
		direction: Direction.SouthWest,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000344,
		},
	},
	//--

	//Demon Square Narrow Mine
	{
		id: 0x80000351,
		name: 'Mine Manager',
		file: 129,
		map: MapID.DemonSquareNarrowMine,
		point: { x: 2096, y: 416 },
		direction: Direction.SouthEast,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000349,
		},
	},
	{
		id: 0x80000350,
		name: 'Mine Merchant',
		file: 102,
		map: MapID.DemonSquareNarrowMine,
		point: { x: 2304, y: 512 },
		direction: Direction.NorthWest,
	},
	//--

	//Devils Gate Narrow Mine
	{
		id: 0x80000353,
		name: 'Mine Manager',
		file: 129,
		map: MapID.DevilsGateNarrowMine,
		point: { x: 2096, y: 416 },
		direction: Direction.SouthEast,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000352,
		},
	},
	{
		id: 0x80000354,
		name: 'Mine Merchant',
		file: 102,
		map: MapID.DevilsGateNarrowMine,
		point: { x: 2304, y: 512 },
		direction: Direction.NorthWest,
	},
	//--

	//Cursed Abyss Narrow Mine
	{
		id: 0x80000356,
		name: 'Mine Manager',
		file: 129,
		map: MapID.CursedAbyssNarrowMine,
		point: { x: 2096, y: 416 },
		direction: Direction.SouthEast,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000355,
		},
	},
	{
		id: 0x80000357,
		name: 'Mine Merchant',
		file: 102,
		map: MapID.CursedAbyssNarrowMine,
		point: { x: 2304, y: 512 },
		direction: Direction.NorthWest,
	},
	//--

	//Flame Ruins Vast Mine
	{
		id: 0x80000359,
		name: 'Mine Manager',
		file: 129,
		map: MapID.FlameRuinsVastMine,
		point: { x: 4080, y: 392 },
		direction: Direction.SouthEast,
		action: {
			type: 'teleport',
			targetNpcId: 0x80000358,
		},
	},
	{
		id: 0x80000360,
		name: 'Mine Merchant',
		file: 102,
		map: MapID.FlameRuinsVastMine,
		point: { x: 4336, y: 496 },
		direction: Direction.NorthWest,
	},
	//--
];
