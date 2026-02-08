import { Logger } from '../../Logger/Logger';
import { battleInstructorFight } from '../../Updater/Data/Fights/SkyPassFights';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionTemplate } from '../GameActionTypes';
import { testFight } from './Templates/TestFight';
import { testShop } from './Templates/TestShop';
import { discipleSkillTrade } from './Templates/DiscipleSkillTrade';
import { addPets } from './Templates/AddPets';
import { deleteCharacter } from './Templates/DeleteCharacter';
import { unlockSkillII } from './Templates/UnlockSkillII';
import { unlockSkillIIIIV } from './Templates/UnlockSkillIIIIV';
import { drowcrusherFight } from './Templates/DrowcrusherFight';
import { battleFelswornFight } from './Templates/BattleFelswornFight';
import { CrabPitEvent } from './Templates/CrabPitActions';
import { MapTester } from './Templates/MapTester';

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
			case 'discipleSkillTrade':
				return new this(action, discipleSkillTrade);
			case 'addPets':
				return new this(action, addPets);
			case 'deleteCharacter':
				return new this(action, deleteCharacter);
			case 'unlockSkillII':
				return new this(action, unlockSkillII);
			case 'unlockSkillIIIIV':
				return new this(action, unlockSkillIIIIV);
			case 'drowcrusherFight':
				return new this(action, drowcrusherFight);
			case 'battleFelswornFight':
				return new this(action, battleFelswornFight);
			case 'crabPitEnter':
				return new this(action, CrabPitEvent.enter);
			case 'crabPitRoll':
				return new this(action, CrabPitEvent.roll);
			case 'crabPitCatch':
				return new this(action, CrabPitEvent.catch);
			case 'mapTester':
				return new this(action, MapTester.menu);
			default:
				Logger.error('Unknown action template', action);
				throw Error('Unknown action template ' + action.template);
		}
	}

	protected run(context: ClientActionContext): void {
		this.callback(context, this.action.params);
	}
}
