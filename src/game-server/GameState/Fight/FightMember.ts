import { FightEffect } from '../../Enums/FightEffect';
import { FightMemberType } from '../../Enums/FightMemberType';
import { Logger } from '../../Logger/Logger';
import { Bitfield } from '../../Utils/Bitfield';
import type { Monster } from '../Monster/Monster';
import { Pet } from '../Pet/Pet';
import { Player } from '../Player/Player';
import { EffectApply } from './EffectApply';
import type { Fight } from './Fight';
import { FightAction } from './FightAction';

export type FightMemberBase = Player | Pet | Monster;

export class FightMember {
	/**
	 * Location in the fight view.
	 * ```
	 * 16 17	9 8
	 * 12 13	5 4
	 * 10 11	1 0
	 * 14 15	3 2
	 * 18 19	7 6
	 * ```
	 */
	public location: number = 0;

	/**
	 * Not sure yet what it is used for.
	 */
	public active: boolean = true;

	/**
	 * Not sure yet what it is used for.
	 */
	public readonly type: FightMemberType;

	/**
	 * FightEffect, multiple can be combined.
	 */
	public readonly effect: Bitfield = new Bitfield(FightEffect.None);

	/**
	 * How many more turns the effects should last.
	 */
	public readonly effectCounters: Map<FightEffect, number> = new Map();

	/**
	 * Stores additional effect data like damage values or source skill levels
	 */
	public readonly effectData: Map<FightEffect, number> = new Map();

	/**
	 * How much damage per turn for effects
	 */
	public perTurnDamage: number = 0;

	/**
	 * The turn goes to the fight member with the lowest nextTurn.
	 * After every turn, increases with 1 / speed.
	 */
	public nextTurn: number;

	/**
	 * The most recent specified action.
	 */
	public readonly action: FightAction;

	/**
	 * Whether the member has acted this turn.
	 */
	public hasActed: boolean = false;

	public constructor(
		public readonly fight: Fight,
		public readonly base: FightMemberBase,
	) {
		this.action = new FightAction(fight, this);

		if (base instanceof Player) this.type = FightMemberType.Player;
		else if (base instanceof Pet) this.type = FightMemberType.Pet;
		else this.type = FightMemberType.Monster;

		base.fightStats.update(base);

		this.nextTurn = 1 / base.fightStats.totals.speed;
	}

	/**
	 * Compares two members based on speed. Used for array sorting.
	 * @param a
	 * @param b
	 * when the difference is less than 100, there is a 30% chance that the slower one will be act faster
	 */
	public static compareSpeed(a: FightMember, b: FightMember): number {
		const speedDiff = b.base.fightStats.totals.speed - a.base.fightStats.totals.speed;

		if (Math.abs(speedDiff) < 100 && Math.random() < 0.3) {
			Logger.debug(
				`Speed order swapped: ${a.base.name}(${a.base.fightStats.totals.speed}) and ${b.base.name}(${b.base.fightStats.totals.speed})`,
			);
			return -speedDiff;
		}

		return speedDiff;
	}

	/**
	 * Compares two members based on hp, ASC. Used for array sorting.
	 * @param a
	 * @param b
	 */
	public static compareHp(a: FightMember, b: FightMember): number {
		return a.base.fightStats.totals.hp - b.base.fightStats.totals.hp;
	}

	/**
	 * Lower the counter of each effect, and remove it if it reaches 0.
	 */
	public doEffectTurn(): void {
		for (let [effect, count] of this.effectCounters) {
			if (count === 0) continue;

			if (this.effect.has(FightEffect.Poison)) this.executePoisonEffect();
			if (this.effect.has(FightEffect.Frailty)) this.executeFrailtyEffect();

			if (count === 1) {
				// Remove bonus stats when effects expire
				if (effect === FightEffect.Speed) {
					const skillLevel = this.effectData.get(effect) ?? 1;
					const baseSpeedByRank = {
						1: 50, // Rank 1: +50 speed (single)
						2: 35, // Rank 2: +35 speed (multi)
						3: 100, // Rank 3: +100 speed (single)
						4: 75, // Rank 4: +75 speed (multi)
					};
					const rank = Math.ceil(skillLevel / 5); // Assuming rank increases every 5 levels
					const baseSpeed = baseSpeedByRank[rank as keyof typeof baseSpeedByRank] ?? 50;
					const levelBonus = (skillLevel - 1) * 15;
					const speedBoost = baseSpeed + levelBonus;

					this.base.fightStats.totals.speed -= speedBoost;
				}

				if (effect === FightEffect.Protect) {
					// Remove protect resistances
					const resistAmount = 15 + (this.effectData.get(effect) ?? 0) * 3;
					this.base.fightStats.totals.resists.fireResist -= resistAmount;
					this.base.fightStats.totals.resists.iceResist -= resistAmount;
					this.base.fightStats.totals.resists.flashResist -= resistAmount;
					this.base.fightStats.totals.resists.evilResist -= resistAmount;
					this.base.fightStats.totals.resists.poisonResist -= resistAmount;
					this.base.fightStats.totals.resists.stunResist -= resistAmount;
					this.base.fightStats.totals.resists.hypnotizeResist -= resistAmount;
					this.base.fightStats.totals.resists.chaosResist -= resistAmount;
					this.base.fightStats.totals.resists.frailtyResist -= resistAmount;
					this.base.fightStats.totals.resists.deathResist -= resistAmount;
				} else if (effect === FightEffect.Repel) {
					const skillLevel = this.effectData.get(effect) ?? 1;
					const reflectAmount = 30 + (skillLevel - 1) * 3;
					this.base.fightStats.totals.resists.magicReflect -= reflectAmount;
					this.base.fightStats.totals.resists.magicReflectDamage -= reflectAmount;
				} else if (effect === FightEffect.Reflect) {
					const skillLevel = this.effectData.get(effect) ?? 1;
					const reflectAmount = 30 + (skillLevel - 1) * 3;
					this.base.fightStats.totals.resists.meleeReflect -= reflectAmount;
					this.base.fightStats.totals.resists.meleeReflectDamage -= reflectAmount;
				} else if (effect === FightEffect.Enhance) {
					const skillLevel = this.effectData.get(effect) ?? 1;
					const bonusAmount = 15 + (skillLevel - 1) * 3;
					this.base.fightStats.totals.resists.berserkRate -= bonusAmount;
					this.base.fightStats.totals.resists.berserkDamage -= bonusAmount;
					this.base.fightStats.totals.resists.pierce -= bonusAmount;
					this.base.fightStats.totals.resists.pierceDamage -= bonusAmount;
					this.base.fightStats.totals.resists.comboRate -= bonusAmount;
					this.base.fightStats.totals.resists.comboHit -= 3 + skillLevel - 1;
					this.base.fightStats.totals.resists.counterAttackRate -= bonusAmount;
					this.base.fightStats.totals.resists.counterAttackDamage -= bonusAmount;
				} else if (effect === FightEffect.Death) {
					if (this.type === FightMemberType.Pet) {
						this.base.fightData.stats.currentHp = 1; // Pets survive with 1 HP
					} else {
						this.base.fightData.stats.currentHp = 0; // Players and monsters die
					}
				}
				this.effect.remove(effect);
			}

			this.effectCounters.set(effect, count - 1);
		}
	}

	/**
	 * Get rid of counters of unused effects.
	 */
	public removeUnusedCounters(): void {
		for (let effect of EffectApply.all) {
			if (!this.effect.has(effect)) this.effect.remove(effect);
		}
	}

	/**
	 * The character is under the effect of poison
	 */
	private executePoisonEffect(): void {
		const skillLevel = this.effectData.get(FightEffect.Poison) ?? 1;
		// Poison deals 15% of max HP as base damage, scaling with skill level
		const poisonDamage = Math.floor(
			this.base.fightData.stats.hp.stat * 0.15 * (1 + skillLevel * 0.1),
		);
		this.base.fightData.stats.addHp(-poisonDamage);

		// Simply call isDead() to update the Dead effect if HP is 0
		this.isDead();
	}

	/**
	 * The character is under the effect of frailty.
	 */
	private executeFrailtyEffect(): void {
		const skillLevel = this.effectData.get(FightEffect.Frailty) ?? 1;
		// Frailty deals 15% of max MP as base damage, scaling with skill level
		const frailtyDamage = Math.floor(
			this.base.fightData.stats.mp.stat * 0.15 * (1 + skillLevel * 0.1),
		);
		this.base.fightData.stats.addMp(-frailtyDamage);
	}

	public isDead(): boolean {
		// Ensure currentHp can't go below 0
		if (this.base.fightData.stats.currentHp < 0) {
			this.base.fightData.stats.currentHp = 0;
		}

		const dead = this.base.fightData.stats.currentHp === 0;
		if (dead && !this.effect.has(FightEffect.Dead)) {
			this.effect.add(FightEffect.Dead);
		}
		return dead;
	}
}
