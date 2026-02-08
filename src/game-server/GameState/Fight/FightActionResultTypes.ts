import type { FightActionType } from '../../Enums/FightActionType';
import type { FightMember } from './FightMember';

export type FightActionResult = {
	type: FightActionType;
	source: number;
	target: number;
	detail?: number;
	stats: FightMember[];
	magic: FightActionResultMagic[];
	data?: Buffer | null;
};

export type FightActionResultMagic = {
	id: number;
	damage: number;
	repel: number;
};
