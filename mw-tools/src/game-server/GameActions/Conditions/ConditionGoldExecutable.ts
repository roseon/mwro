import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionGold } from '../GameConditionTypes';

/**
 * Checks if the player has the given amount of gold (or more).
 */
export class ConditionGoldExecutable extends GameConditionExecutable<ClientActionContext> {
	protected constructor(protected override readonly condition: GameConditionGold) {
		super(condition);
	}

	public static parse(condition: GameConditionGold): ConditionGoldExecutable {
		return new this(condition);
	}

	protected run({ player }: ClientActionContext): boolean {
		return player.items.gold >= this.condition.amount;
	}
}
