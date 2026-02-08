import type { ItemProperties } from '../Database/Collections/BaseItem/BaseItemTypes';
import type { CharacterRace } from '../Enums/CharacterClass';

export type GameConditionBase<TType extends string> = {
	type: TType;
	not?: true;
};

export type GameConditionAnd = GameConditionBase<'and'> & {
	conditions: GameCondition[];
};

export type GameConditionOr = GameConditionBase<'or'> & {
	conditions: GameCondition[];
};

export type GameConditionId = GameConditionBase<'id'> & {
	id: string;
};

export type GameConditionTemplate = GameConditionBase<'template'> & {
	template: string;
	params?: Record<string, unknown>;
};

export type GameConditionRandom = GameConditionBase<'random'> & {
	/** Chance from 0 to 100 */
	chance: number;
};

export type GameConditionQuest = GameConditionBase<'quest'> & {
	quest: number;
	stage?: number;
};

export type GameConditionItem = GameConditionBase<'item'> & {
	baseItemId: number;
	count?: number;
	includeBank?: boolean;
};

export type GameConditionItemSpace = GameConditionBase<'itemSpace'> & {
	baseItemId?: number;
	count?: number;
};

export type GameConditionGold = GameConditionBase<'gold'> & {
	amount: number;
};

export type GameConditionLevel = GameConditionBase<'level'> & {
	min?: number;
	max?: number;
	inclusive?: boolean;
};

export type GameConditionRace = GameConditionBase<'race'> & {
	race: CharacterRace;
};

export type GameConditionHasPet = GameConditionBase<'hasPet'> & {
	/** Optional pet ID to check for a specific pet */
	petId?: number;
	/** Optional pet template name to check for a specific type of pet */
	template?: string;
	/** Optional minimum loyalty level required */
	minLoyalty?: number;
	/** Optional minimum intimacy level required */
	minIntimacy?: number;
};

export type GameConditionPetLevel = GameConditionBase<'petLevel'> & {
	min?: number;
	max?: number;
	inclusive?: boolean;
};

export type GameConditionPromptResponse = GameConditionBase<'promptResponse'> & {
	// No additional fields needed - just checks if there's a response
};

export type GameConditionItemProp = GameConditionBase<'itemProp'> & {
	itemProperties: ItemProperties;
};

export type GameConditionSingle =
	| null
	| GameConditionAnd
	| GameConditionOr
	| GameConditionId
	| GameConditionTemplate
	| GameConditionRandom
	| GameConditionQuest
	| GameConditionItem
	| GameConditionItemSpace
	| GameConditionGold
	| GameConditionLevel
	| GameConditionRace
	| GameConditionHasPet
	| GameConditionPetLevel
	| GameConditionPromptResponse
	| GameConditionItemProp;

export type GameCondition = string | string[] | GameConditionSingle | GameConditionSingle[];
