import type { GameMap } from '../../GameState/Map/GameMap';
import { Point } from '../../Utils/Point';
import { Random } from '../../Utils/Random';

export type MapLinkJson = {
	id: number;
	map: number;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

export class MapLink {
	public readonly id: number;
	private readonly start: Point;
	private readonly end: Point;
	public readonly dest: GameMap | null;

	public constructor(json: MapLinkJson, maps: Map<number, GameMap>) {
		this.id = json.id;
		this.start = new Point(json.x1, json.y1).toMapPoint();
		this.end = new Point(json.x2, json.y2).toMapPoint();

		// For now just set the destination to the first that matches the file
		// Later add a way to override this for custom maps
		this.dest = [...maps.values()].find(m => m.file === json.map) ?? null;
	}

	/**
	 * Get a random location within the maplink area.
	 */
	public getDestinationCoordinates(): Point {
		return new Point(
			Random.int(this.start.x, this.end.x),
			Random.int(this.start.y, this.end.y),
		);
	}
}
