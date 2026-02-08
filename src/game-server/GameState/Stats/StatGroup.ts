export type StatGroupJson = {
	rate: number;
	pointsBase: number;
};

/**
 * Groups together multiple features applied to the same stat.
 * Points refers to things like sta, while stat refers to things like hp.
 */
export enum StatType {
	HP,
	MP,
	ATTACK,
	SPEED
}

export class StatGroup {
	private _rate: number;
	private _pointsBase: number;
	private _pointsAdded: number = 0;
	private _pointsTotal: number = 0;
	private _statBase: number = 0;
	private _statAdded: number = 0;
	private _statTotal: number = 0;
	private _growthRate: number;
	private _statType: StatType;

	/**
	 * The rate for this stat.
	 */
	public get rate(): number {
		return this._rate;
	}
	public set rate(rate: number) {
		this._rate = rate;
		this.onChange();
	}

	/**
	 * The number of statpoints given.
	 */
	public get pointsBase(): number {
		return this._pointsBase;
	}
	public set pointsBase(pointsBase: number) {
		this._pointsBase = pointsBase;
		this.onChange();
	}

	/**
	 * Statpoints given through items / potions.
	 */
	public get pointsAdded(): number {
		return this._pointsAdded;
	}
	public set pointsAdded(pointsAdded: number) {
		this._pointsAdded = pointsAdded;
		this.onChange();
	}

	/**
	 * The resulting stat based on the statpoints.
	 */
	public get statBase(): number {
		return this._statBase;
	}

	/**
	 * Stat increase through items / potions.
	 */
	public get statAdded(): number {
		return this._statAdded;
	}
	public set statAdded(statAdded: number) {
		this._statAdded = statAdded;
		this.onChange();
	}

	/**
	 * The growth rate.
	 */
	public get growthRate(): number {
		return this._growthRate;
	}
	public set growthRate(growthRate: number) {
		this._growthRate = growthRate;
		this.onChange();
	}

	/**
	 * Total number of statpoints (such as sta).
	 */
	public get points(): number {
		return this._pointsTotal;
	}

	/**
	 * Total external stats (such as hp).
	 */
	public get stat(): number {
		return this._statTotal;
	}

	public constructor(json: StatGroupJson, growthRate: number, statType: StatType) {
		this._rate = json.rate;
		this._pointsBase = json.pointsBase;
		this._growthRate = growthRate;
		this._statType = statType;
		this.onChange();
	}

	/**
	 * Data to be stored.
	 * Does not include calculated or added values.
	 */
	public toJson(): StatGroupJson {
		return {
			rate: this._rate,
			pointsBase: this._pointsBase,
		};
	}

	/**
	 * Update the totals and calculate the stats based on the points.
	 */
	private onChange(): void {
		this._pointsTotal = this._pointsBase + this._pointsAdded;
		
		switch (this._statType) {
			case StatType.HP:
				this._statBase = this.calculateHPStat();
				break;
			case StatType.MP:
				this._statBase = this.calculateMPStat();
				break;
			case StatType.ATTACK:
				this._statBase = this.calculateAttackStat();
				break;
			case StatType.SPEED:
				this._statBase = this.calculateSpeedStat();
				break;
		}

		this._statTotal = this._statBase + this._statAdded;
	}

	private calculateHPStat(): number {
		return ~~(
			this._rate +
			0.003 * this._rate * this.growthRate * (this._pointsTotal + 10) ** 2
		);
	}

	private calculateMPStat(): number {
		return ~~(
			this._rate +
			0.0025 * this._rate * this.growthRate * (this._pointsTotal + 8) ** 1.9
		);
	}

	private calculateAttackStat(): number {
		return ~~(
			this._rate +
			0.003 * this._rate * this.growthRate * (this._pointsTotal + 5) ** 2.0
		);
	}

	private calculateSpeedStat(): number {
		return ~~(
			this._rate +
			0.0010 * this._rate * this.growthRate * (this._pointsTotal + 7) ** 1.6
		);
	}
}
