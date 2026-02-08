import { GameConditionCache } from '../GameConditionCache';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionId } from '../GameConditionTypes';

/**
 * Checks a condition by id.
 */
export class ConditionIdExecutable<TContext> extends GameConditionExecutable<TContext> {
	protected constructor(protected override readonly condition: GameConditionId) {
		super(condition);
	}

	public static parse<T>(condition: GameConditionId): ConditionIdExecutable<T> {
		return new this(condition);
	}

	protected run(context: TContext): boolean {
		return GameConditionCache.getInstance().get(this.condition.id)?.execute(context) ?? false;
	}
}
