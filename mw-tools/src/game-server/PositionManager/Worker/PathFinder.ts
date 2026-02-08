import { Point } from '../../Utils/Point';
import { PriorityQueue } from '../../Utils/PriorityQueue';

const Sqrt2 = Math.sqrt(2);
const CostStraight = 10;
const CostDiagonal = Sqrt2 * 10;
const MaxDistance = 1800;

const Adjacents = [
	{ x: -1, y: -1, cost: CostDiagonal },
	{ x: 0, y: -1, cost: CostStraight },
	{ x: 1, y: -1, cost: CostDiagonal },
	{ x: -1, y: 0, cost: CostStraight },
	{ x: 1, y: 0, cost: CostStraight },
	{ x: -1, y: 1, cost: CostDiagonal },
	{ x: 0, y: 1, cost: CostStraight },
	{ x: 1, y: 1, cost: CostDiagonal },
];

/**
 * Used for finding the path between two coordinates.
 * Initialised with map-specific data.
 * Note, all coordinates and sizes here are grid coordinates and sizes,
 * these are not the coordinates stored on players.
 */
export class PathFinder {
	private readonly gCosts: Uint16Array; // score from start to index
	private readonly hCosts: Uint16Array; // score from index to end
	private readonly parents: Int32Array;

	public constructor(
		private cellData: Buffer,
		private width: number,
		private height: number,
	) {
		if (cellData.length !== width * height) throw Error('Unexpected cellData size.');

		this.gCosts = new Uint16Array(width * height);
		this.hCosts = new Uint16Array(width * height);
		this.parents = new Int32Array(width * height);
		this.parents.fill(-1);
	}

	/**
	 * Find the shortest path from start to end.
	 * @param start
	 * @param end
	 */
	public findPath(start: Point, end: Point): Point[] | null {
		let index = start.getIndex(this.width);
		let endIndex = end.getIndex(this.width);

		// Reject if start and end are the same
		if (index === endIndex) return null;

		// Reject if coords are off-grid
		if (this.isOutOfBounds(start.x, start.y) || this.isOutOfBounds(end.x, end.y)) return null;

		// Reject if start or end is “locked”
		if (this.isLocked(index) || this.isLocked(endIndex)) return null;

		let optim = this.tryOptimized(start, end);
		if (optim !== null) return optim;

		let open: PriorityQueue<number> = new PriorityQueue(i => this.getScore(i));
		let closed: Map<number, number> = new Map();
		let result: number[] = [];
		open.push(index);

		while (!open.isEmpty()) {
			index = open.pop()!;
			closed.set(index, index);

			if (index === endIndex) {
				result = this.followParents(index);
				break;
			}

			let x = this.getX(index);
			let y = this.getY(index);

			for (let adjacent of Adjacents) {
				let ax = x + adjacent.x;
				let ay = y + adjacent.y;
				let ai = this.getIndex(ax, ay);

				if (closed.has(ai) || this.isLocked(ai) || this.isOutOfBounds(ax, ay)) continue;

				let gCost = this.gCosts[index] + adjacent.cost;
				let visited = this.parents[ai] !== -1;

				if (visited && this.gCosts[ai] <= gCost) continue;

				this.parents[ai] = index;
				this.gCosts[ai] = gCost;

				if (visited) {
					open.moveTowardsFrontObj(ai);
				} else {
					let dist = this.distance(ax, ay, end.x, end.y);

					if (dist > MaxDistance) continue;

					this.hCosts[ai] = dist;
					open.push(ai);
				}
			}
		}

		// Clean up parents
		closed.forEach(i => (this.parents[i] = -1));
		open.getAllUnordered().forEach(i => (this.parents[i] = -1));

		return result.map(i => new Point(this.getX(i), this.getY(i)));
	}

	/**
	 * Find a straight path without blocked parts.
	 * @param start
	 * @param end
	 * @returns an array of points from end to start.
	 */
	private tryOptimized(start: Point, end: Point): Point[] | null {
		let points = this.getLine(start, end);

		for (let point of points) {
			let index = this.getIndex(point.x, point.y);
			if (this.isLocked(index)) return null;
		}

		return points.reverse();
	}

	/**
	 * Get a straight line from start to end.
	 * @param start
	 * @param end
	 */
	private getLine(start: Point, end: Point): Point[] {
		let dx = Math.abs(start.x - end.x);
		let dy = Math.abs(start.y - end.y);
		let dd = Math.max(dx, dy);
		let points: Point[] = [];

		for (let i = 0; i <= dd; i++) {
			let t = i / dd;
			points.push(new Point(this.lerp(start.x, end.x, t), this.lerp(start.y, end.y, t)));
		}

		return points;
	}

	/**
	 * Linear interpolation.
	 * @param start
	 * @param end
	 * @param t
	 */
	private lerp(start: number, end: number, t: number): number {
		return ~~(start + t * (end - start));
	}

	/**
	 * Follow the parents to reach the start.
	 * @param index end index
	 * @returns an array of indexes from end to start.
	 */
	private followParents(index: number): number[] {
		let list: number[] = [];

		while (index !== -1) {
			list.push(index);
			index = this.parents[index];
		}

		return list;
	}

	/**
	 * Get the index of the given coordinates.
	 * @param x
	 * @param y
	 */
	private getIndex(x: number, y: number): number {
		return y * this.width + x;
	}

	/**
	 * Get the x-coordinate for an index.
	 * @param index
	 */
	private getX(index: number): number {
		return index % this.width;
	}

	/**
	 * Get the y-coordinate for an index.
	 * @param index
	 */
	private getY(index: number): number {
		return ~~(index / this.width);
	}

	/**
	 * Used by the PriorityQueue.
	 * @param index
	 */
	private getScore(index: number): number {
		return this.gCosts[index] + this.hCosts[index];
	}

	/**
	 * Check if the position is walkable.
	 * @param index
	 */
	private isLocked(index: number): boolean {
		if (index < 0 || index >= this.cellData.length) return true; // Out of bounds check
		return (this.cellData.readUInt8(index) & 0x80) !== 0;
	}

	/**
	 * Check if the coordinates are within the grid.
	 * @param x
	 * @param y
	 */
	private isOutOfBounds(x: number, y: number): boolean {
		return x < 0 || y < 0 || x > this.width || y > this.height;
	}

	/**
	 * Calculate the distance between two points.
	 * Used as heuristic (hCost).
	 * @param startX
	 * @param startY
	 * @param endX
	 * @param endY
	 */
	private distance(startX: number, startY: number, endX: number, endY: number): number {
		let dx = Math.abs(startX - endX);
		let dy = Math.abs(startY - endY);
		return (dx + dy + (Sqrt2 - 2) * Math.min(dx, dy)) * 10;
	}
}
