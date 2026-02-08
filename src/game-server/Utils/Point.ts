import { Random } from './Random';

export type PointJson = { x: number; y: number };

/**
 * Immutable point for x/y pairs.
 */
export class Point {
	public static readonly Zero: Point = new Point(0, 0);

	public constructor(public readonly x: number, public readonly y: number) {}

	/**
	 * Turn json object into instance.
	 * @param json
	 */
	public static fromJson(json: PointJson): Point {
		return new Point(json.x, json.y);
	}

	/**
	 * Create point based on grid indexing.
	 * @param index
	 * @param width
	 */
	public static fromIndex(index: number, width: number): Point {
		return new Point(index % width, ~~(index / width));
	}

	/**
	 * Compare two points.
	 * @param point
	 */
	public equals(point: Point): boolean {
		return this.x === point.x && this.y === point.y;
	}

	/**
	 * Create point with added values.
	 * @param x
	 * @param y
	 */
	public add(x: number, y: number): Point {
		return new Point(this.x + x, this.y + y);
	}

	/**
	 * Create point with added point.
	 * @param point
	 */
	public addPoint(point: Point): Point {
		return this.add(point.x, point.y);
	}

	/**
	 * Create point with the difference between two points.
	 * @param point
	 */
	public diff(point: Point): Point {
		return new Point(Math.abs(this.x - point.x), Math.abs(this.y - point.y));
	}

	/**
	 * Convert from pixels / player data to in-game / grid coordinates.
	 */
	public toGridPoint(): Point {
		return new Point(~~(this.x / 16), ~~(this.y / 8));
	}

	/**
	 * Convert from in-game / grid coordinates to pixels / player data.
	 */
	public toMapPoint(): Point {
		return new Point(this.x * 16, this.y * 8);
	}

	/**
	 * Get grid index based on these coordinates.
	 * @param width
	 */
	public getIndex(width: number): number {
		return this.y * width + this.x;
	}

	/**
	 * Get random point near this point.
	 * @param minDistance
	 * @param maxDistance
	 */
	public getRandomNearby(minDistance: number, maxDistance: number): Point {
		let direction = Random.number(0, 2 * Math.PI);
		let distance = Random.number(minDistance, maxDistance);

		return this.add(
			Math.round(distance * Math.cos(direction)),
			Math.round(distance * Math.sin(direction)),
		);
	}

	/**
	 * Format as string.
	 */
	public toString(): string {
		return `(${this.x}, ${this.y})`;
	}
}
