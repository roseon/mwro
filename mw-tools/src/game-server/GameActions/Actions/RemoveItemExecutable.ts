import { Random } from '../../Utils/Random';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionRemoveItem } from '../GameActionTypes';

/**
 * Remove an item from the player.
 */
export class RemoveItemExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionRemoveItem) {
		super(action);
	}

	public static parse(action: GameActionRemoveItem): RemoveItemExecutable {
		return new this(action);
	}

	protected run({ game, player }: ClientActionContext): void {
		let baseItem = game.baseItems.get(this.action.baseItemId);

		if (!baseItem) throw Error('Unknown base item id ' + this.action.baseItemId);

		let amount = Random.fromJson(this.action.amount ?? 1);
		player.items.removeItemAndSend(baseItem.id, amount);
	}
}
