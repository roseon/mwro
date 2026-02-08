import type { GameAction } from '../../../GameActions/GameActionTypes';

export type MapJson = {
	id: number;
	name: string;
	file: number;
	musicFile: number;
	minimapFile: number | null;
	fightMusicFile: number;
	fightBackgroundFile: number;
	randomMonsters: string[];
	onMapPlayerFightWin?: GameAction | null;
	fightFrequency: number;
};
