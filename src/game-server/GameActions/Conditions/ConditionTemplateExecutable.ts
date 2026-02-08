import { Logger } from '../../Logger/Logger';
import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionTemplate } from '../GameConditionTypes';
import { isValidNumber } from './Templates/IsValidNumber';
import { isValidItemId } from './Templates/IsValidItemId';

export type ConditionTemplateCallback = (
	context: ClientActionContext,
	params?: Record<string, unknown>,
) => boolean;

/**
 * Executes custom conditions.
 */
export class ConditionTemplateExecutable extends GameConditionExecutable<ClientActionContext> {
	protected constructor(
		protected override readonly condition: GameConditionTemplate,
		protected readonly callback: ConditionTemplateCallback,
	) {
		super(condition);
	}

	public static parse(condition: GameConditionTemplate): ConditionTemplateExecutable {
		switch (condition.template) {
			case 'isValidNumber':
				return new this(condition, isValidNumber);
			case 'isValidItemId':
				return new this(condition, isValidItemId);

			default:
				Logger.error('Unknown condition template', condition);
				throw Error('Unknown condition template ' + condition.template);
		}
	}

	protected run(context: ClientActionContext): boolean {
		// Evaluate template parameters before passing to callback
		const evaluatedParams: Record<string, unknown> = {};
		if (this.condition.params) {
			for (const [key, value] of Object.entries(this.condition.params)) {
				if (typeof value === 'string' && value === '${promptText}') {
					evaluatedParams[key] = context.player.memory.promptText;
				} else {
					evaluatedParams[key] = value;
				}
			}
		}
		return this.callback(context, evaluatedParams);
	}
}
