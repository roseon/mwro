import { GameConditionExecutable } from '../GameConditionExecutable';
import { GameConditionParser } from '../GameConditionParser';
import type { GameConditionOr, GameConditionSingle } from '../GameConditionTypes';

/**
 * Checks if at least one condition is true.
 */
export class OrExecutable<TContext> extends GameConditionExecutable<TContext> {
	protected constructor(
		protected override condition: GameConditionSingle,
		protected conditions: GameConditionExecutable<TContext>[],
	) {
		super(condition);
	}

	public static parse<T>(condition: GameConditionOr): OrExecutable<T> {
		let conditions = condition.conditions.map(con => GameConditionParser.parse(con));
		return new this<T>(condition, conditions);
	}

	protected run(context: TContext): boolean {
		return this.conditions.some(con => con.execute(context));
	}
}
