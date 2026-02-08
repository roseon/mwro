import type { StatGroupJson } from './StatGroup';
import { StatGroup, StatType } from './StatGroup';

export type StatsJson = {
	hp: StatGroupJson;
	mp: StatGroupJson;
	attack: StatGroupJson;
	speed: StatGroupJson;
	growthRate: number;
	currentHp?: number;
	currentMp?: number;
	unused?: number;
};

export class Stats {
	public hp: StatGroup;
	public mp: StatGroup;
	public attack: StatGroup;
	public speed: StatGroup;
	public growthRate: number;
	public currentHp: number;
	public currentMp: number;
	public unused: number;

	public constructor(json: StatsJson) {
		this.hp = new StatGroup(json.hp, json.growthRate, StatType.HP);
		this.mp = new StatGroup(json.mp, json.growthRate, StatType.MP);
		this.attack = new StatGroup(json.attack, json.growthRate, StatType.ATTACK);
		this.speed = new StatGroup(json.speed, json.growthRate, StatType.SPEED);
		this.growthRate = json.growthRate;
		this.currentHp = json.currentHp ?? this.hp.stat;
		this.currentMp = json.currentMp ?? this.mp.stat;
		this.unused = json.unused ?? 0;
	}

	/**
	 * Turn stats into storable object.
	 */
	public toJson(): StatsJson {
		return {
			growthRate: this.growthRate,
			currentHp: this.currentHp,
			currentMp: this.currentMp,
			hp: this.hp.toJson(),
			mp: this.mp.toJson(),
			attack: this.attack.toJson(),
			speed: this.speed.toJson(),
			unused: this.unused,
		};
	}

	/**
	 * Set hp to max.
	 */
	public healHp(): void {
		this.currentHp = this.hp.stat;
	}

	/**
	 * Set mp to max.
	 */
	public healMp(): void {
		this.currentMp = this.mp.stat;
	}

	/**
	 * Add/subtract hp. Stays within 0 to total hp range.
	 * @param hp
	 */
	public addHp(hp: number): void {
		this.currentHp = Math.max(0, Math.min(this.currentHp + hp, this.hp.stat));
	}

	/**
	 * Add/subtract mp. Stays within 0 to total mp range.
	 * @param hp
	 */
	public addMp(mp: number): void {
		this.currentMp = Math.max(0, Math.min(this.currentMp + mp, this.mp.stat));
	}

	/**
	 * Add/subtract hp by percentage of the players total health.
	 * @param value Value from 0 and 100
	 */
	public addHpPerc(value: number): void {
		this.addHp((this.hp.stat * value) / 100);
	}

	/**
	 * Add/subtract mp by percentage of the players total mana.
	 * @param value Value from 0 and 100
	 */
	public addMpPerc(value: number): void {
		this.addMp((this.mp.stat * value) / 100);
	}

	/**
	 * Add stat points if needed
	 * @param level
	 */
	public updateStatPointsForLevel(level: number): void {
		let sumPoints =
			this.attack.pointsBase +
			this.speed.pointsBase +
			this.hp.pointsBase +
			this.mp.pointsBase +
			this.unused;

		let reward = level * 8 - sumPoints;

		if (reward > 0) {
			// Calculate how many levelup stats should be rewarded
			let levels = Math.floor(reward / 8);
			this.attack.pointsBase += levels;
			this.speed.pointsBase += levels;
			this.hp.pointsBase += levels;
			this.mp.pointsBase += levels;
			this.unused += 4 * levels;
		}
	}

}
