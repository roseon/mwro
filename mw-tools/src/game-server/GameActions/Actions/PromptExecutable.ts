import { PromptPackets } from '../../Responses/PromptPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import { GameActionParser } from '../GameActionParser';
import type { GameActionPrompt } from '../GameActionTypes';

/**
 * Shows a prompt dialog to the player.
 */
export class PromptExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(
		protected override readonly action: GameActionPrompt,
		protected readonly message: string,
		protected readonly onResponse: GameActionExecutable<ClientActionContext> | null,
	) {
		super(action);
	}

	public static parse(action: GameActionPrompt): GameActionExecutable<ClientActionContext> {
		if (!action.message?.length) return this.noop;

		let onResponse = action.onResponse ? GameActionParser.parse(action.onResponse) : null;
		return new this(action, action.message, onResponse);
	}

	protected run({ client, player }: ClientActionContext): void {
		// Store the response handler if there is one
		player.memory.promptResponse = this.onResponse;

		// Send the prompt packet
		client.write(PromptPackets.show(this.message));
	}
}
