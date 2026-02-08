import { NpcPackets } from '../../Responses/NpcPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import { GameActionParser } from '../GameActionParser';
import type { GameActionNpcOption, GameActionNpcSay, GameActionSingle } from '../GameActionTypes';
import type { GameConditionExecutable } from '../GameConditionExecutable';
import { GameConditionParser } from '../GameConditionParser';
import { NpcSayExecutable } from './NpcSayExecutable';

type NpcOptionExecutable = {
	condition: GameConditionExecutable<ClientActionContext> | null;
	text: string;
	action: GameActionExecutable<ClientActionContext>;
};

/**
 * Shows an npc dialog with options.
 */
export class NpcSayOptionsExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(
		protected override readonly action: GameActionSingle,
		protected readonly message: string,
		protected readonly options: NpcOptionExecutable[],
	) {
		super(action);
	}

	public static parse(
		action: GameActionNpcSay & { options: GameActionNpcOption[] },
	): GameActionExecutable<ClientActionContext> {
		// If no message, set it to an empty string.
		if (!action.message?.length) action.message = '';

		// Message is a string, parse options and return executable.
		if (typeof action.message === 'string') {
			let options: NpcOptionExecutable[] = action.options.map(opt => ({
				text: opt.text,
				action: GameActionParser.parse(opt.action),
				condition: opt.condition ? GameConditionParser.parse(opt.condition) : null,
			}));

			return new this(action, action.message, options);
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

		// Options apply to last message
		actions[actions.length - 1].options = action.options;

		return NpcSayExecutable.parse(actions[0]);
	}

	protected run(context: ClientActionContext): void {
		// Check conditions of options
		let options = this.options.filter(
			opt => opt.condition === null || opt.condition.execute(context),
		);

		// No options, just show a closable message if there is one
		if (options.length === 0) {
			context.player.memory.npcOptions = null;

			if (this.message) context.client.write(NpcPackets.dialogClosable(this.message));

			return;
		}

		context.player.memory.npcOptions = options.map(opt => opt.action);
		let message = this.message + '\0' + options.map(opt => opt.text).join('&');

		context.client.write(NpcPackets.dialogWithOptions(message));
	}
}
