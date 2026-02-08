import { Logger } from '../Logger/Logger';
import { AndExecutable } from './Conditions/AndExecutable';
import { ConditionGoldExecutable } from './Conditions/ConditionGoldExecutable';
import { ConditionIdExecutable } from './Conditions/ConditionIdExecutable';
import { ConditionItemExecutable } from './Conditions/ConditionItemExecutable';
import { ConditionItemSpaceExecutable } from './Conditions/ConditionItemSpaceExecutable';
import { ConditionLevelExecutable } from './Conditions/ConditionLevelExecutable';
import { ConditionQuestExecutable } from './Conditions/ConditionQuestExecutable';
import { ConditionRandomExecutable } from './Conditions/ConditionRandomExecutable';
import { ConditionTemplateExecutable } from './Conditions/ConditionTemplateExecutable';
import { OrExecutable } from './Conditions/OrExecutable';
import type { ClientActionContext } from './GameActionContext';
import { GameConditionExecutable } from './GameConditionExecutable';
import type { GameCondition } from './GameConditionTypes';
import { ConditionRaceExecutable } from './Conditions/ConditionRaceExecutable';
import { ConditionHasPetExecutable } from './Conditions/ConditionHasPetExecutable';
import { ConditionPetLevelExecutable } from './Conditions/ConditionPetLevelExecutable';
import { ConditionPromptResponseExecutable } from './Conditions/ConditionPromptResponseExecutable';
import { ConditionItemPropExecutable } from './Conditions/ConditionItemPropExecutable';

export class GameConditionParser {
	protected constructor() {}

	/**
	 * Turn a json condition into an executable.
	 * @param action
	 */
	public static parse(condition?: GameCondition): GameConditionExecutable<ClientActionContext> {
		if (!condition) return GameConditionExecutable.true;

		if (typeof condition === 'string')
			condition = {
				type: 'id',
				id: condition,
			};

		if (Array.isArray(condition))
			condition = {
				type: 'and',
				conditions: condition,
			};

		switch (condition.type) {
			case 'and':
				return AndExecutable.parse(condition);
			case 'or':
				return OrExecutable.parse(condition);
			case 'id':
				return ConditionIdExecutable.parse(condition);
			case 'template':
				return ConditionTemplateExecutable.parse(condition);
			case 'random':
				return ConditionRandomExecutable.parse(condition);
			case 'quest':
				return ConditionQuestExecutable.parse(condition);
			case 'item':
				return ConditionItemExecutable.parse(condition);
			case 'itemSpace':
				return ConditionItemSpaceExecutable.parse(condition);
			case 'gold':
				return ConditionGoldExecutable.parse(condition);
			case 'level':
				return ConditionLevelExecutable.parse(condition);
			case 'race':
				return ConditionRaceExecutable.parse(condition);
			case 'hasPet':
				return ConditionHasPetExecutable.parse(condition);
			case 'petLevel':
				return ConditionPetLevelExecutable.parse(condition);
			case 'promptResponse':
				return ConditionPromptResponseExecutable.parse(condition);
			case 'itemProp':
				return ConditionItemPropExecutable.parse(condition);
			default:
				Logger.error('Condition type not implemented', condition);
				throw Error('Condition type not implemented.');
		}
	}
}
