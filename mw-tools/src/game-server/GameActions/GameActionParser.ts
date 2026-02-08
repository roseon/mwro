import { Logger } from '../Logger/Logger';
import { ActionIdExecutable } from './Actions/ActionIdExecutable';
import { ActionTemplateExecutable } from './Actions/ActionTemplateExecutable';
import { AddExpExecutable } from './Actions/AddExpExecutable';
import { AddGoldExecutable } from './Actions/AddGoldExecutable';
import { AddMonsterExecutable } from './Actions/AddMonsterExecutable';
import { AddItemExecutable } from './Actions/AddItemExecutable';
import { ArrayExecutable } from './Actions/ArrayExecutable';
import { HealExecutable } from './Actions/HealExecutable';
import { NpcSayExecutable } from './Actions/NpcSayExecutable';
import { QuestExecutable } from './Actions/QuestExecutable';
import { RemoveItemExecutable } from './Actions/RemoveItemExecutable';
import { TeleportExecutable } from './Actions/TeleportExecutable';
import type { ClientActionContext } from './GameActionContext';
import { GameActionExecutable } from './GameActionExecutable';
import type { GameAction } from './GameActionTypes';
import { AddPetExecutable } from './Actions/AddPetExecutable';
import { GiveItemExecutable } from './Actions/GiveItemExecutable';
import { ShopExecutable } from './Actions/ShopExecutable';
import { AddTitleExecutable } from './Actions/AddTitleExecutable';
import { PromptExecutable } from './Actions/PromptExecutable';
import { MoveExecutable } from './Actions/MoveExecutable';
import { RemoveLastItemUsedExecutable } from './Actions/RemoveLastItemUsedExecutable';
import { AddItemPropsExecutable } from './Actions/AddItemPropsExecutable';
import { BankExecutable } from './Actions/BankExecutable';
import { ShapeShiftExecutable } from './Actions/ShapeShiftExecutable';
import { MonsterRepelExecutable } from './Actions/MonsterRepelExecutable';
import { PetResetExpExecutable } from './Actions/PetResetExpExecutable';
import { PetResetStatsExecutable } from './Actions/PetResetStatsExecutable';
import { PetResetGrowthExecutable } from './Actions/PetResetGrowthExecutable';
import { PetAddGrowthExecutable } from './Actions/PetAddGrowthExecutable';
import { PetAddResistExecutable } from './Actions/PetAddResistExecutable';
import { PetResetResistExecutable } from './Actions/PetResetResistExecutable';
import { PetResetLevelExecutable } from './Actions/PetResetLevelExecutable';
import { PetResetLoyaltyExecutable } from './Actions/PetResetLoyaltyExecutable';
import { DecreaseStatsExecutable } from './Actions/DecreaseStatsExecutable';

export abstract class GameActionParser {
	/**
	 * Turn a json action into an executable.
	 * @param action
	 */
	public static parse(action?: GameAction | null): GameActionExecutable<ClientActionContext> {
		if (!action) return GameActionExecutable.noop;

		if (typeof action === 'string')
			action = {
				type: 'id',
				id: action,
			};

		if (Array.isArray(action)) {
			action = {
				type: 'array',
				actions: action,
			};
		}

		switch (action.type) {
			case 'noop':
				return GameActionExecutable.noop;
			case 'array':
				return ArrayExecutable.parse(action);
			case 'id':
				return ActionIdExecutable.parse(action);
			case 'template':
				return ActionTemplateExecutable.parse(action);
			case 'npcSay':
				return NpcSayExecutable.parse(action);
			case 'teleport':
				return TeleportExecutable.parse(action);
			case 'heal':
				return HealExecutable.parse(action);
			case 'exp':
				return AddExpExecutable.parse(action);
			case 'petExp':
				return AddExpExecutable.parse({
					...action,
					type: 'exp',
					pet: true,
				});
			case 'monster':
				return AddMonsterExecutable.parse(action);
			case 'quest':
				return QuestExecutable.parse(action);
			case 'addItem':
				return AddItemExecutable.parse(action);
			case 'addPet':
				return AddPetExecutable.parse(action);
			case 'removeItem':
				return RemoveItemExecutable.parse(action);
			case 'gold':
				return AddGoldExecutable.parse(action);
			case 'give-item':
				return GiveItemExecutable.parse(action);
			case 'shop':
				return ShopExecutable.parse(action);
			case 'bank':
				return BankExecutable.parse(action);
			case 'addTitle':
				return AddTitleExecutable.parse(action);
			case 'prompt':
				return PromptExecutable.parse(action);
			case 'move':
				return MoveExecutable.parse(action);
			case 'addItemProps':
				return AddItemPropsExecutable.parse(action);
			case 'removeLastItemUsed':
				return RemoveLastItemUsedExecutable.parse(action);
			case 'shapeShift':
				return ShapeShiftExecutable.parse(action);
			case 'monsterRepel':
				return MonsterRepelExecutable.parse(action);
			case 'petResetExp':
				return PetResetExpExecutable.parse(action);
			case 'petResetLevel':
				return PetResetLevelExecutable.parse(action);
			case 'petResetLoyalty':
				return PetResetLoyaltyExecutable.parse(action);
			case 'decreaseStats':
				return DecreaseStatsExecutable.parse(action);
			case 'petResetStats':
				return PetResetStatsExecutable.parse(action);
			case 'petResetGrowth':
				return PetResetGrowthExecutable.parse(action);
			case 'petAddGrowth':
				return PetAddGrowthExecutable.parse(action);
			case 'petAddResist':
				return PetAddResistExecutable.parse(action);
			case 'petResetResist':
				return PetResetResistExecutable.parse(action);
			default:
				Logger.error('Action type not implemented', action);
				throw Error('Action type not implemented.');
		}
	}
}
