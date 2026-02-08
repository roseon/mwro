import { GameConditionExecutable } from '../GameConditionExecutable';
import { GameConditionParser } from '../GameConditionParser';
import type { GameConditionAnd, GameConditionSingle } from '../GameConditionTypes';

/**
 * Checks if all conditions are true.
 */
export class AndExecutable<TContext> extends GameConditionExecutable<TContext> {
	protected constructor(
		protected override readonly condition: GameConditionSingle,
		protected readonly conditions: GameConditionExecutable<TContext>[],
	) {
		super(condition);
	}

	public static parse<T>(condition: GameConditionAnd): AndExecutable<T> {
		let conditions = condition.conditions.map(con => GameConditionParser.parse(con));
		return new this<T>(condition, conditions);
	}

	protected run(context: TContext): boolean {
		return this.conditions.every(con => con.execute(context));
	}
}
