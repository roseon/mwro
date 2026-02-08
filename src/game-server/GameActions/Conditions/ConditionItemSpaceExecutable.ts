import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionItemSpace } from '../GameConditionTypes';

/**
 * Checks if the player has space for an item.
 * Count defaults to 1. With no baseItemId it will check the amount of slots.
 */
export class ConditionItemSpaceExecutable extends GameConditionExecutable<ClientActionContext> {
	private baseItemId: number | null;
	private count: number;

	protected constructor(protected override readonly condition: GameConditionItemSpace) {
		super(condition);
		this.baseItemId = condition.baseItemId ?? null;
		this.count = condition.count ?? 1;
	}

	public static parse(condition: GameConditionItemSpace): ConditionItemSpaceExecutable {
		return new this(condition);
	}

	protected run({ player, game }: ClientActionContext): boolean {
		if (this.baseItemId === null) return player.items.inventory.freeSize >= this.count;

		let baseItem = game.baseItems.get(this.baseItemId);

		if (!baseItem) throw Error('Unknown base item id ' + this.baseItemId);

		return player.items.inventory.hasSpaceFor(baseItem, this.count);
	}
}
