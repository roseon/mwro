import type { Direction } from '../../Enums/Direction';
import type { PointJson } from '../../Utils/Point';
import { Point } from '../../Utils/Point';
import type { GameMap } from '../Map/GameMap';

export type IndividualMapDataJson = {
	point: PointJson;
	direction: Direction;
	canWalk?: boolean;
	map: number;
};

export abstract class IndividualMapData {
	public point: Point;

	public dest: Point;

	public direction: Direction;

	public canWalk: boolean;

	public map: GameMap;

	protected constructor(json: IndividualMapDataJson, maps: Map<number, GameMap>) {
		this.point = this.dest = Point.fromJson(json.point);
		this.direction = json.direction;
		this.canWalk = json.canWalk ?? true;
		let map = maps.get(json.map);

		if (!map) throw Error('Cannot initialise map data: map not found.');

		this.map = map;
	}
}
