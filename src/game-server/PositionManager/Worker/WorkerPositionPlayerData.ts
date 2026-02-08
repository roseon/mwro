import type { Point } from '../../Utils/Point';
import { BasePositionPlayerData } from '../BasePositionPlayerData';
import { PathFinder } from './PathFinder';

export type PositionUpdate = { id: number; steps: number };

/**
 * Uses pathfinding to update player positions.
 */
export class WorkerPositionPlayerData extends BasePositionPlayerData {
	private readonly pathFinders: Map<number, PathFinder> = new Map();
	private readonly routes: Map<number, Point[]> = new Map();

	/**
	 * Create pathfinder for this map.
	 * @param map
	 * @param width
	 * @param height
	 * @param cells
	 */
	public initMap(map: number, width: number, height: number, cells: Buffer): void {
		this.pathFinders.set(map, new PathFinder(cells, ~~(width / 16), ~~(height / 8)));
	}

	/**
	 * Update the positions of all players.
	 * @returns ids of players that have been updated
	 */
	public updatePositions(): PositionUpdate[] {
		let updates: PositionUpdate[] = [];

		for (let i = 0; i < WorkerPositionPlayerData.maxPlayers; ++i) {
			let update = this.updatePosition(i);

			if (update) updates.push(update);
		}

		return updates;
	}

	/**
	 * Update the position of the player in this buffer index.
	 * @param index
	 */
	private updatePosition(index: number): PositionUpdate | null {
		let id = this.getId(index);

		// No player in this buffer slot
		if (id === 0) return null;

		let start = this.getGridPoint(index);
		let end = this.getDestGridPoint(index);

		// Player already at destination
		if (start.equals(end)) return null;

		let map = this.getMap(index);
		let pf = this.pathFinders.get(map);

		if (!pf) throw Error(`No pathfinder initialised for map ${map}`);

		let prev = this.routes.get(id);
		let path: Point[];

		// Same destination as previous loop, reuse route
		if (prev?.[0]?.equals(end)) {
			path = prev;
		} else {
			let result = pf.findPath(start, end);

			if (result === null) return null;

			// Last is always the start coordinates
			result.pop();

			path = result;
			this.routes.set(id, path);
		}

		let pathLength = path.length;

		if (pathLength === 0) return null;

		// Move 9 points
		// TODO: may need to depend on diagonals and time passed
		let steps = Math.min(pathLength, 9);
		let next = path[pathLength - steps];
		this.skipSteps(path, steps);
		this.setGridPoint(index, next);

		return { id, steps };
	}

	/**
	 * Remove a number of items from the end of the array.
	 * @param path
	 * @param steps
	 */
	private skipSteps(path: Point[], steps: number): void {
		// Repeated pops is faster than splice on smaller amounts
		for (let i = 0; i < steps; ++i) path.pop();
	}
}
