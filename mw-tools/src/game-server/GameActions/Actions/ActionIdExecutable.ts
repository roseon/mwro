import { GameActionCache } from '../GameActionCache';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionId } from '../GameActionTypes';

/**
 * Executes actions by id.
 */
export class ActionIdExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionId) {
		super(action);
	}

	public static parse(action: GameActionId): ActionIdExecutable {
		return new this(action);
	}

	protected run(context: ClientActionContext): void {
		GameActionCache.getInstance().get(this.action.id)?.execute(context);
	}
}
