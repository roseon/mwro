import type { GameMap } from '../../GameState/Map/GameMap';
import type { Point } from '../../Utils/Point';
import type { MapLinkJson } from './MapLink';
import { MapLink } from './MapLink';

export type MapFileJson = {
	map: number;
	width: number;
	height: number;
	links: MapLinkJson[];
};

export class MapLinks {
	/**
	 * Number of grid cells in width.
	 */
	private width: number;

	/**
	 * Number of grid cells in height.
	 */
	private height: number;

	/**
	 * Links to other maps.
	 */
	private links: Map<number, MapLink>;

	public constructor(json: MapFileJson, maps: Map<number, GameMap>, private cells: Buffer) {
		this.width = ~~(json.width / 16);
		this.height = ~~(json.height / 8);
		this.links = new Map(json.links.map(link => [link.id, new MapLink(link, maps)]));
	}

	/**
	 * Get the map link for the given coordinates.
	 * @param point
	 */
	public getMapLink(point: Point): MapLink | null {
		let index = point.toGridPoint().getIndex(this.width);
		let value = this.cells.readUInt8(index);

		if ((value & 0x40) === 0) return null;

		let id = value & 0x3f;
		return this.links.get(id) ?? null;
	}
}
