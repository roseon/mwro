import type { EquipmentSlot } from '../../../Enums/EquipmentSlot';
import type { ClientActionContext } from '../../../GameActions/GameActionContext';
import type { GameActionExecutable } from '../../../GameActions/GameActionExecutable';
import type { GameAction } from '../../../GameActions/GameActionTypes';
import type { FightStatJson } from '../../../GameState/Fight/FightStats';
import type { ItemType } from '../../../GameState/Item/ItemType';

export type BaseItemJson = {
	id: number;
	file: number;
	stackLimit: number;
	name: string;
	petId?: number;
	description: string;
	type: ItemType;
	equipmentSlot?: EquipmentSlot | null;
	action?: GameAction | null;
	questItem?: boolean;
	stats?: FightStatJson;
	level?: number;
	race?: number;
	gender?: number;
	itemProperties?: ItemPropertiesJson;
	canConvert?: boolean;
	supportedEquipmentSlots?: EquipmentSlot[];
};

export type ItemGemsJson = {
	id: number;
	stats: FightStatJson;
}

export type ItemPropertiesJson = {
	bindLocation?: {
		map?: number;
		x?: number;
		y?: number;
	};

	gems?: ItemGemsJson[];
};

export type ItemProperties = {
	bindLocation?: {
		map?: number;
		x?: number;
		y?: number;
	};

	gems?: ItemGemsJson[]
};

export type BaseItem = {
	id: number;
	file: number;
	stackLimit: number;
	name: string;
	description: string;
	type: ItemType;
	equipmentSlot: EquipmentSlot | null;
	action: GameActionExecutable<ClientActionContext> | null;
	questItem: boolean;
	stats?: FightStatJson;
	level?: number;
	race?: number;
	gender?: number;
	petId?: number;
	itemProperties?: ItemProperties;
	canConvert?: boolean;
	supportedEquipmentSlots?: EquipmentSlot[];
};
