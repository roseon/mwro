import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionItem } from '../GameConditionTypes';

/**
 * Checks if the player has an item.
 * Count defaults to 1, checks if the player has at least that amount of the game.
 */
export class ConditionItemExecutable extends GameConditionExecutable<ClientActionContext> {
	private count: number;
	private includeBank: boolean;

	protected constructor(protected override readonly condition: GameConditionItem) {
		super(condition);
		this.count = condition.count ?? 1;
		this.includeBank = condition.includeBank ?? false;
	}

	public static parse(condition: GameConditionItem): ConditionItemExecutable {
		return new this(condition);
	}

	protected run({ player }: ClientActionContext): boolean {
		return player.items.getItemCount(this.condition.baseItemId, this.includeBank) >= this.count;
	}
}
