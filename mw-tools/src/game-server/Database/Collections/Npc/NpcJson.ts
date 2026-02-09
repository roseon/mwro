import type { Direction } from '../../../Enums/Direction';
import type { GameAction } from '../../../GameActions/GameActionTypes';
import type { PointJson } from '../../../Utils/Point';

// NPCType as enum
export enum NpcType {
	Forge = 1,
	Pet = 2,
	Gem = 3,
	GemConverter = 4,
	Buyer = 5,
}

export type NpcJson = {
	id: number;
	name: string;
	file: number;
	map: number;
	point: PointJson;
	direction: Direction;
	action?: GameAction;
	giveaction?: GameAction;
	type?: NpcType;
	spawnByDefault?: boolean;
	spawnTime?: string; // Format: 'HH:mm'
};
