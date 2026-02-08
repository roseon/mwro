import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionPromptResponse } from '../GameConditionTypes';

/**
 * Checks if the player entered a response to the prompt.
 */
export class ConditionPromptResponseExecutable extends GameConditionExecutable<ClientActionContext> {
	protected constructor(protected override readonly condition: GameConditionPromptResponse) {
		super(condition);
	}

	public static parse(condition: GameConditionPromptResponse): ConditionPromptResponseExecutable {
		return new this(condition);
	}

	protected run({ player }: ClientActionContext): boolean {
		return player.memory.promptText !== null && player.memory.promptText.trim().length > 0;
	}
}
