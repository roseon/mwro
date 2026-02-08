import { Logger } from '../../Logger/Logger';
import { battleInstructorFight } from '../../Updater/Data/Fights/SkyPassFights';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionTemplate } from '../GameActionTypes';
import { testFight } from './Templates/TestFight';
import { testShop } from './Templates/TestShop';

export type ActionTemplateCallback = (
	context: ClientActionContext,
	params?: Record<string, unknown>,
) => void;

/**
 * Executes custom functions.
 */
export class ActionTemplateExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(
		protected override readonly action: GameActionTemplate,
		protected readonly callback: ActionTemplateCallback,
	) {
		super(action);
	}

	public static parse(action: GameActionTemplate): ActionTemplateExecutable {
		switch (action.template) {
			case 'testFight':
				return new this(action, testFight);
			case 'testShop':
				return new this(action, testShop);
			case 'battleInstructorFight':
				return new this(action, battleInstructorFight);
			default:
				Logger.error('Unknown action template', action);
				throw Error('Unknown action template ' + action.template);
		}
	}

	protected run(context: ClientActionContext): void {
		this.callback(context, this.action.params);
	}
}
