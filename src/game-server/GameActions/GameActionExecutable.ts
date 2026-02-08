import { Logger } from '../Logger/Logger';
import { GameActionParser } from './GameActionParser';
import type { GameActionSingle } from './GameActionTypes';
import type { GameConditionExecutable } from './GameConditionExecutable';
import { GameConditionParser } from './GameConditionParser';

/**
 * An action that can be executed.
 */
export abstract class GameActionExecutable<TContext> {
	/**
	 * Executable action that does nothing.
	 */
	public static readonly noop: GameActionExecutable<unknown> =
		new (class extends GameActionExecutable<unknown> {
			public constructor() {
				super({ type: 'noop' });
			}
			public override execute(): boolean {
				return true;
			}
			protected run(): void {
				return;
			}
		})();

	/**
	 * Will be checked before executing the action.
	 */
	protected condition: GameConditionExecutable<TContext> | null;

	/**
	 * Called when the condition fails.
	 */
	protected else: GameActionExecutable<TContext> | null;

	protected constructor(protected action: GameActionSingle) {
		this.condition = action.condition ? GameConditionParser.parse(action.condition) : null;
		this.else = action.else ? GameActionParser.parse(action.else) : null;
	}

	/**
	 * Execute this action. Returns the result of the condition.
	 * @param context
	 */
	public execute<T extends TContext>(context: T): boolean {
		try {
			let allowed = this.condition ? this.condition.execute(context) : true;

			if (allowed) this.run(context);
			else this.else?.execute(context);

			return allowed;
		} catch (up: unknown) {
			Logger.error('Error during execution of game action', this.action, up);
			throw up;
		}
	}

	/**
	 * The logic for this action.
	 * @param context
	 */
	protected abstract run<T extends TContext>(context: T): void;
}
