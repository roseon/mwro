import type { GameMap } from '../../GameState/Map/GameMap';
import { Point } from '../../Utils/Point';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionSingle, GameActionTeleport } from '../GameActionTypes';

/**
 * Executes a teleport to either an NPC's location or specific coordinates.
 */
export class TeleportExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(
		protected override readonly action: GameActionSingle,
		protected readonly targetNpcId?: number,
		protected readonly coordinates?: { map: number; x: number; y: number },
		protected readonly useStoredLocation?: boolean,
	) {
		super(action);
	}

	public static parse(action: GameActionTeleport): TeleportExecutable {
		return new this(action, action.targetNpcId, action.coordinates, action.useStoredLocation);
	}

	protected run({ game, player }: ClientActionContext): void {
		let map: GameMap;
		let point: Point;

		if (this.useStoredLocation) {
			const index = player.memory.lastItemUsedIndex;
			if (index === null) return;

			const item = player.items.inventory.get(index);
			if (!item?.itemProperties?.bindLocation) return;

			const bindLocation = item.itemProperties.bindLocation;
			if (!bindLocation.map || !bindLocation.x || !bindLocation.y) return;

			map = game.maps.get(bindLocation.map)!;
			point = new Point(bindLocation.x, bindLocation.y);
			point = point.toMapPoint();
		} else if (this.coordinates) {
			map = game.maps.get(this.coordinates.map)!;
			point = new Point(this.coordinates.x, this.coordinates.y);
			point = point.toMapPoint();
		} else if (this.targetNpcId) {
			let npc = game.npcs.get(this.targetNpcId);

			if (!npc) return;

			map = npc.mapData.map;
			point = npc.mapData.point
				.add(-16, -16)
				.toGridPoint()
				.getRandomNearby(5, 10)
				.toMapPoint();
		} else {
			return;
		}

		if (!map) return;
		if (!point) return;

		game.positionManager.onRequestMapChange(player, map, point);
	}
}
