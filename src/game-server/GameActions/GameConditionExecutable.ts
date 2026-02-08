import { Logger } from '../Logger/Logger';
import type { GameConditionSingle } from './GameConditionTypes';

/**
 * A condition that can be executed.
 */
export abstract class GameConditionExecutable<TContext> {
	/**
	 * Condition that always returns true.
	 */
	public static readonly true: GameConditionExecutable<unknown> =
		new (class extends GameConditionExecutable<unknown> {
			public constructor() {
				super(null);
			}
			public override execute(): boolean {
				return true;
			}
			protected run(): boolean {
				return true;
			}
		})();

	/**
	 * Condition that always returns false.
	 */
	public static readonly false: GameConditionExecutable<unknown> =
		new (class extends GameConditionExecutable<unknown> {
			public constructor() {
				super(null);
			}
			public override execute(): boolean {
				return false;
			}
			protected run(): boolean {
				return false;
			}
		})();

	protected constructor(protected condition: GameConditionSingle) {}

	/**
	 * Call the condition.
	 * @param context
	 */
	public execute<T extends TContext>(context: T): boolean {
		try {
			let result = this.run(context);
			return this.condition?.not ? !result : result;
		} catch (up: unknown) {
			Logger.error('Error during execution of game condition', this.condition, up);
			throw up;
		}
	}

	/**
	 * The logic for this condition.
	 * @param context
	 */
	protected abstract run<T extends TContext>(context: T): boolean;
}
