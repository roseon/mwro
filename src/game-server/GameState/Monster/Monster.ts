import { FightStats } from '../Fight/FightStats';
import type { ClientActionContext } from '../../GameActions/GameActionContext';
import type { GameActionExecutable } from '../../GameActions/GameActionExecutable';
import type { IndividualJson } from '../Individual/Individual';
import { Individual } from '../Individual/Individual';
import type { IndividualFightDataJson } from '../Individual/IndividualFightData';
import { MonsterFightData } from './MonsterFightData';
import type { MonsterRewardsJson } from './MonsterRewards';
import { Skill } from '../../Enums/Skill';

export type MonsterJson = IndividualJson & {
	fightData: IndividualFightDataJson;
	onMonsterPlayerFightWin?: GameActionExecutable<ClientActionContext> | null;
	onFightClose?: GameActionExecutable<ClientActionContext> | null;
	rewards?: MonsterRewardsJson;
	level: number;
};

export class Monster extends Individual {
	public fightData: MonsterFightData;

	public fightStats: FightStats;
	public onMonsterPlayerFightWin?: GameActionExecutable<ClientActionContext> | null = null;
	public onFightClose?: GameActionExecutable<ClientActionContext> | null = null;
	public rewards?: MonsterRewardsJson = { expBase: 0, goldBase: 0 };

	public level: number = 0;

	public mapData: null = null;

	public constructor(json: MonsterJson) {
		super(json);
		this.fightData = new MonsterFightData(json.fightData);
		this.fightStats = new FightStats(this);
		this.onMonsterPlayerFightWin = json.onMonsterPlayerFightWin;
		this.onFightClose = json.onFightClose;
		this.rewards = json.rewards;
		this.level = json.level;
	}
}
