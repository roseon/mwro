import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionItemProp } from '../GameConditionTypes';

export class ConditionItemPropExecutable extends GameConditionExecutable<ClientActionContext> {
	protected constructor(protected override readonly condition: GameConditionItemProp) {
		super(condition);
	}

	public static parse(condition: GameConditionItemProp): ConditionItemPropExecutable {
		return new this(condition);
	}

	public override run({ player }: ClientActionContext): boolean {
		// Get the item from the last used item index
		const index = player.memory.lastItemUsedIndex;

		if (index === null) {
			return false;
		}

		const item = player.items.inventory.get(index);

		if (!item?.itemProperties) {
			return false;
		}

		// If we're just checking for any properties
		if (
			!this.condition.itemProperties ||
			Object.keys(this.condition.itemProperties).length === 0
		) {
			// Return true if the item has any properties
			return Object.keys(item.itemProperties).length > 0;
		}

		// Otherwise, do the exact match check
		return (
			JSON.stringify(item.itemProperties) === JSON.stringify(this.condition.itemProperties)
		);
	}
}
