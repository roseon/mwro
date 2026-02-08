import { GameActionExecutable } from '../GameActionExecutable';
import { GameActionParser } from '../GameActionParser';
import type { GameActionArray, GameActionSingle } from '../GameActionTypes';

/**
 * Executes multiple executables.
 */
export class ArrayExecutable<TContext> extends GameActionExecutable<TContext> {
	protected constructor(
		protected override readonly action: GameActionSingle,
		protected readonly actions: GameActionExecutable<TContext>[],
	) {
		super(action);
	}

	public static parse<T>(action: GameActionArray): ArrayExecutable<T> {
		let actions = action.actions.map(act => GameActionParser.parse(act));
		return new this<T>(action, actions);
	}

	protected run(context: TContext): void {
		this.actions.forEach(act => act.execute(context));
	}
}
