import { Logger } from '../../Logger/Logger';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionRemoveLastItemUsed } from '../GameActionTypes';

/**
 * Remove an item from the player.
 */
export class RemoveLastItemUsedExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionRemoveLastItemUsed) {
		super(action);
	}

	public static parse(action: GameActionRemoveLastItemUsed): RemoveLastItemUsedExecutable {
		return new this(action);
	}

	protected run({ player }: ClientActionContext): void {
		let index = player.memory.lastItemUsedIndex;
		if (index === null || index < 0) {
			Logger.error(`Invalid last item used index: ${index}`);
			return;
		}

		player.items.reduceItem(index);
		player.memory.lastItemUsedIndex = null;
	}
}
