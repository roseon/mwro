/**
 * Manages level, reborn and exp.
 * Used mainly by players and pets.
 * @todo exp for reborn 2 and 3
 */
export class Level {
	/**
	 * Maximum reachable level per reborn.
	 */
	private static readonly maxLevels: number[] = [104, 124];

	/**
	 * Arrays filled with total exp needed per level.
	 * @example
	 * To go from non-reborn level 5 to 6, you would
	 * need `levelExpMaps[0][6] - levelExpMaps[0][5]` exp.
	 */
	private static readonly levelExpMaps: number[][] = [
		Level.createLevelExpArray(0),
		Level.createLevelExpArray(1),
	];

	/**
	 * Current total exp, includes exp gained for previous levels.
	 */
	public get totalExp(): number {
		return this._totalExp;
	}

	/**
	 * Reborn count.
	 */
	public get reborn(): number {
		return this._reborn;
	}

	/**
	 * Current level.
	 */
	public get level(): number {
		return this._level;
	}

	/**
	 * Current exp relative to the level.
	 */
	public get currentLvlExp(): number {
		return this._totalExp - Level.levelExpMaps[this._reborn][this._level];
	}

	/**
	 * How much exp the next level needs compared to the current level.
	 */
	public get nextLvlExp(): number {
		return (
			Level.levelExpMaps[this._reborn][this._level + 1] -
			Level.levelExpMaps[this._reborn][this._level]
		);
	}

	/**
	 * How much exp is needed to level up.
	 */
	public get neededExp(): number {
		return Level.levelExpMaps[this._reborn][this._level + 1] - this._totalExp;
	}

	/**
	 * The maximum level for the current rebirth.
	 */
	public get maxLevel(): number {
		return Level.maxLevels[this._reborn];
	}

	/**
	 * The maximum total exp for the current rebirth.
	 */
	public get maxTotalExp(): number {
		return Level.levelExpMaps[this._reborn][this.maxLevel];
	}

	/**
	 * Current total exp.
	 */
	private _totalExp: number = 0;

	/**
	 * Current rebirth.
	 */
	private _reborn: number = 0;

	/**
	 * Current level.
	 */
	private _level: number = 0;

	private constructor() {}

	/**
	 * Create a Level object based on total exp.
	 * @param totalExp
	 * @param reborn
	 */
	public static fromExp(totalExp: number, reborn: number = 0): Level {
		let lvl = new Level();
		lvl._totalExp = totalExp;
		lvl._reborn = reborn;
		lvl._level = this.getLevelForTotalExp(totalExp, reborn);

		return lvl;
	}

	/**
	 * Create a level object based on level.
	 * @param level
	 * @param reborn
	 */
	public static fromLevel(level: number, reborn: number = 0): Level {
		let lvl = new Level();
		lvl._totalExp = this.levelExpMaps[reborn][level];
		lvl._reborn = reborn;
		lvl._level = level;

		return lvl;
	}

	/**
	 * Creates an array with total exp needed for each level.
	 * @param reborn
	 */
	private static createLevelExpArray(reborn: number): number[] {
		// Add one to calculate exp needed at the highest level.
		let maxLevel = Level.maxLevels[reborn] + 1;
		// Add one because we index by level and arrays start at zero.
		let map = new Array(maxLevel + 1);
		map[0] = 0;
		map[1] = 0;

		// Start at 2 so it gives the right exp difference when going from 1 to 2
		for (let i = 2; i <= maxLevel; ++i) map[i] = this.getTotalExpForLevel(i, reborn);

		return map;
	}

	/**
	 * Calculate how much total exp is needed for the given level.
	 * @param level
	 * @param reborn
	 */
	private static getTotalExpForLevel(level: number, reborn: number): number {
		if (reborn === 0) {
			if (level < 49) return Math.floor(3.4 * Math.pow(level + 2, 4));
			else return 4 * Math.pow(level, 4);
		} else if (reborn === 1) {
			return Math.round(4.8 * Math.pow(level, 4));
		} else {
			throw Error('Not implemented.');
		}
	}

	/**
	 * Find the level one would be with the given totalExp.
	 * @param totalExp
	 * @param reborn
	 */
	private static getLevelForTotalExp(totalExp: number, reborn: number): number {
		let index = this.levelExpMaps[reborn].findIndex(n => n > totalExp);
		return Math.min(Math.max(1, index - 1), this.maxLevels[reborn]);
	}

	/**
	 * Increase or decrease exp, will update level if needed.
	 * Returns how many levels were gained (can be negative).
	 * @param exp
	 */
	public addExp(exp: number): number {
		let max = this.maxTotalExp;

		// Already at max, do nothing
		if (this._totalExp >= max) return 0;

		let prevLevel = this._level;

		// Getting to max
		if (this._totalExp + exp >= max) {
			this._totalExp = max;
			this._level = this.maxLevel;
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

			if (shouldCalcLevel)
				this._level = Level.getLevelForTotalExp(this._totalExp, this._reborn);
		}

		return this._level - prevLevel;
	}
}
