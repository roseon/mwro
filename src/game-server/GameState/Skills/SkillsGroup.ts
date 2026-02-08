import { getConfig } from '../../Config/Config';
import { getSkillAmount } from './SkillAmount';
import { getSkillDuration } from './SkillDuration';
import { getSkillTargets } from './SkillRankTarget';

export type SkillsGroupJson = {
	id: number;
	exp: number;
};

export class SkillsGroup {
	private _id: number;
	private _level: number = 1;
	private _totalExp: number = 0;
	private static readonly maxLevel: number = 11;
	private maxLevelsReborn: number[] = [10, SkillsGroup.maxLevel];
	private _targets: number = 1;
	private _amount: number = 0;
	private _duration: number = 0;

	public constructor(id: number) {
		this._id = id;
		this.updateSkill();
	}

	private updateSkill(): void {
		this._targets = getSkillTargets(this.id)[this.level - 1];
		this._amount = getSkillAmount(this._id)[this.level - 1];
		this._duration = getSkillDuration(this._id)[this.level - 1];
	}

	/**
	 * Amount of targets to hit
	 */
	public get targets(): number {
		return this._targets;
	}

	/**
	 * Damage for attacking spells and percentage for drain/poison/frailty
	 */
	public get amount(): number {
		return this._amount;
	}

	/**
	 * Duration for spells
	 */
	public get duration(): number {
		return this._duration;
	}

	/**
	 * Id of the skill
	 */
	public get id(): number {
		return this._id;
	}

	/**
	 * Current exp relative to the level.
	 */
	public get exp(): number {
		return this._totalExp;
	}

	/**
	 * Current total exp, includes exp gained for previous levels.
	 */
	public get totalExp(): number {
		return this._totalExp;
	}

	/**
	 * Current level.
	 */
	public get level(): number {
		return this._level;
	}

	/**
	 * Turn skills into storable object.
	 */
	public toJson(): SkillsGroupJson {
		return {
			id: this._id,
			exp: this._totalExp,
		};
	}

	/**
	 * Arrays filled with total exp needed per level.
	 * @example
	 * To go from  level 5 to 6, you would
	 * need `levelExpMaps[6] - levelExpMaps[5]` exp.
	 */
	public static readonly levelExpMaps: number[] = [
		0, 0, 60, 130, 312, 690, 1372, 2490, 4200, 6682, 10140, 14802,
	];

	/**
	 * Create a SkillsGroup object based on total exp.
	 * @param totalExp
	 */
	public static fromExp(id: number, totalExp: number): SkillsGroup {
		let skill = new SkillsGroup(id);
		skill._totalExp = totalExp;
		skill._level = this.getLevelForTotalExp(totalExp);

		skill.updateSkill();

		return skill;
	}

	/**
	 * Create a SkillsGroup object based on level.
	 * @param level
	 */
	public static fromLevel(id: number, level: number): SkillsGroup {
		let skill = new SkillsGroup(id);
		skill._totalExp = this.levelExpMaps[level];
		skill._level = level;

		skill.updateSkill();

		return skill;
	}

	/**
	 * Find the level one would be with the given totalExp.
	 * @param totalExp
	 */
	private static getLevelForTotalExp(totalExp: number): number {
		let index = this.levelExpMaps.findIndex(n => n >= totalExp);
		return Math.min(Math.max(1, index), this.maxLevel);
	}

	public maxLevelReborn(reborn: number): number {
		if (reborn > this.maxLevelsReborn.length) {
			return this.maxLevelsReborn[this.maxLevelsReborn.length - 1];
		}
		return this.maxLevelsReborn[reborn];
	}

	/**
	 * The maximum total exp for the current rebirth.
	 */
	public maxTotalExp(reborn: number): number {
		return SkillsGroup.levelExpMaps[this.maxLevelReborn(reborn)];
	}

	/**
	 * How much exp is needed to level up.
	 */
	public get neededExp(): number {
		return SkillsGroup.levelExpMaps[this._level + 1] - this._totalExp;
	}

	/**
	 * Current exp relative to the level.
	 */
	public get currentLvlExp(): number {
		return this._totalExp - SkillsGroup.levelExpMaps[this._level];
	}

	/**
	 * Increase or decrease exp, will update level if needed.
	 * Returns how many levels were gained (can be negative).
	 * @param exp
	 */
	public addExp(exp: number, reborn: number): number {
		let prevLevel = this.level;
		let max = this.maxTotalExp(reborn);

		exp = exp * getConfig().modifiers.skill;

		// Already at max, do nothing
		if (this._totalExp >= max) return 0;

		// Getting to max
		if (this._totalExp + exp >= max) {
			this._totalExp = max;
			this._level = this.maxLevelReborn(reborn);
		}
		// Going below 0
		else if (this._totalExp + exp <= 0) {
			this._totalExp = 0;
			this._level = 1;
		}
		// The usual
		else {
			let shouldCalcLevel = exp > 0 ? exp >= this.neededExp : -exp > this.currentLvlExp;
			this._totalExp += exp;
			if (shouldCalcLevel) this._level = SkillsGroup.getLevelForTotalExp(this._totalExp);
		}

		if (prevLevel != this.level) {
			this.updateSkill();
		}

		return this.level - prevLevel;
	}
}
