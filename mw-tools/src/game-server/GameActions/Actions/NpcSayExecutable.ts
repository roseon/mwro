import { NpcPackets } from '../../Responses/NpcPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import { GameActionParser } from '../GameActionParser';
import type { GameActionNpcSay, GameActionSingle } from '../GameActionTypes';
import { NpcSayOptionsExecutable } from './NpcSayOptionsExecutable';

/**
 * Shows one or more npc dialogs.
 */
export class NpcSayExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(
		protected override readonly action: GameActionSingle,
		protected readonly message: string,
		protected readonly onClose: GameActionExecutable<ClientActionContext> | null,
	) {
		super(action);
	}

	public static parse(action: GameActionNpcSay): GameActionExecutable<ClientActionContext> {
		// There are options, so switch to the options parser
		if ('options' in action && action.options?.length)
			return NpcSayOptionsExecutable.parse(action);

		// No options and no message, so do nothing
		if (!action.message?.length) return this.noop;

		// Just a regular message
		if (typeof action.message === 'string') {
			let onClose = 'onClose' in action ? GameActionParser.parse(action.onClose) : null;
			return new this(action, action.message, onClose);
		}

		// Message is array with 1 item, so replace array with string
		if (action.message.length === 1) {
			action.message = action.message[0];
			return this.parse(action);
		}

		// Turn array of messages into array of actions
		let actions: GameActionNpcSay[] = action.message.map(message => ({
			type: 'npcSay',
			message,
		}));

		// The onClose of each message is starting the next message
		for (let i = 0, l = actions.length - 1; i < l; ++i) actions[i].onClose = actions[i + 1];

		// Condition applies to first message
		actions[0].condition = action.condition;
		actions[0].else = action.else;

		// OnClose applies to last message
		actions[actions.length - 1].onClose = action.onClose;

		return this.parse(actions[0]);
	}

	protected run({ client, player }: ClientActionContext): void {
		player.memory.npcOptions = this.onClose ? [this.onClose] : null;
		client.write(NpcPackets.dialogClosable(this.message));
	}
}
