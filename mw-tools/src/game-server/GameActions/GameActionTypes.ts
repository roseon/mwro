import type { PetTemplate } from '../Data/PetTemplates';
import type { ItemProperties } from '../Database/Collections/BaseItem/BaseItemTypes';
import { FightStatJson } from '../GameState/Fight/FightStats';
import type { RandomJson } from '../Utils/Random';
import type { GameCondition } from './GameConditionTypes';

type GameActionBase<TType extends string> =
	| {
			type: TType;
			condition?: never;
			else?: never;
	  }
	| {
			type: TType;
			condition: GameCondition;
			else?: GameAction;
	  };

export type GameActionNoop = GameActionBase<'noop'>;

export type GameActionArray = GameActionBase<'array'> & {
	actions: GameAction[];
};

export type GameActionId = GameActionBase<'id'> & {
	id: string;
};

export type GameActionTemplate = GameActionBase<'template'> & {
	template: string;
	params?: Record<string, unknown>;
};

export type GameActionNpcSay = GameActionBase<'npcSay'> &
	(
		| {
				message: string | string[];
				onClose?: GameAction;
				options?: never;
		  }
		| {
				message?: string | string[];
				onClose?: never;
				options: GameActionNpcOption[];
		  }
	);

export type GameActionNpcOption = {
	condition?: GameCondition;
	text: string;
	action?: GameAction;
	else?: GameAction;
};

export type GameActionTeleport = GameActionBase<'teleport'> & {
	targetNpcId?: number;
	coordinates?: {
		map: number;
		x: number;
		y: number;
	};
	useStoredLocation?: boolean;
};

export type GameActionShop = GameActionBase<'shop'> & {
	items: {
		itemId: number;
		price: number;
	}[];
};

export type GameActionBank = GameActionBase<'bank'> & {
	operation: 'withdraw' | 'deposit' | 'withdrawGold' | 'depositGold';
};

export type GameActionHeal = GameActionBase<'heal'> & {
	isPerc?: boolean;
	pet?: boolean;
} & (
		| {
				hp: number;
				mp?: number;
		  }
		| {
				hp?: number;
				mp: number;
		  }
	);

export type GameActionExp = GameActionBase<'exp'> & {
	amount: number | RandomJson;
	pet?: boolean;
};

export type GameActionMonster = GameActionBase<'monster'> & {};

export type GameActionQuest = GameActionBase<'quest'> & {
	add?:
		| number
		| {
				quest: number;
				stage?: number;
				chain?: {
					quest: number;
					stage?: number;
				}[];
		  };
	remove?: number;
	set?: {
		quest: number;
		stage: number;
	};
};

export type GameActionAddItem = GameActionBase<'addItem'> & {
	baseItemId: number | string;
	amount?: number | RandomJson;
};

export type GameActionAddPet = GameActionBase<'addPet'> & {
	pet: string;
};

export type GameActionRemoveItem = GameActionBase<'removeItem'> & {
	baseItemId: number;
	amount?: number | RandomJson;
};

export type GameActionGold = GameActionBase<'gold'> & {
	amount: number | RandomJson;
};

export type GameActionGiveItem = GameActionBase<'give-item'> & {
	recipientId: string;
	baseItemId: string;
	amount?: number | RandomJson;
};

export type GameActionAddTitle = GameActionBase<'addTitle'> & {
	titleId: number;
};

export type GameActionPrompt = GameActionBase<'prompt'> & {
	message: string;
	onResponse?: GameAction;
};

export type GameActionMove = GameActionBase<'move'> & {
	point?: {
		x: number;
		y: number;
	};
	respawn: {
		type: 'interval' | 'time';
		value: number | string[];
		activeHours?: {
			start: string;
			end: string;
		};
	};
	respawnRadius?: {
		min: number;
		max: number;
	};
	despawn?: {
		type: 'interval' | 'time';
		value: number | string[];
		activeHours?: {
			start: string;
			end: string;
		};
	};
};

export type GameActionAddItemProps = GameActionBase<'addItemProps'> & {
	properties: ItemProperties;
};

export type GameActionRemoveLastItemUsed = GameActionBase<'removeLastItemUsed'> & {};

export type GameActionShapeShift = GameActionBase<'shapeShift'> & {
	file: number;
	name?: string;
	stats?: FightStatJson;
};

export type GameActionMonsterRepel = GameActionBase<'monsterRepel'> & {
	duration: number;
	applyEffect: boolean;
};

export type GameActionSingle =
	| GameActionNoop
	| GameActionArray
	| GameActionId
	| GameActionTemplate
	| GameActionNpcSay
	| GameActionTeleport
	| GameActionShop
	| GameActionBank
	| GameActionHeal
	| GameActionExp
	| GameActionMonster
	| GameActionQuest
	| GameActionAddItem
	| GameActionAddPet
	| GameActionRemoveItem
	| GameActionGold
	| GameActionGiveItem
	| GameActionAddTitle
	| GameActionPrompt
	| GameActionMove
	| GameActionAddItemProps
	| GameActionRemoveLastItemUsed
	| GameActionShapeShift
	| GameActionMonsterRepel;

export type GameAction = string | string[] | GameActionSingle | GameActionSingle[];
