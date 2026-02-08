import { skillProperties } from '../../Data/SkillProperties';
import { FightActionType } from '../../Enums/FightActionType';
import { FightEffect } from '../../Enums/FightEffect';
import { SkillType } from '../../Enums/SkillType';
import { Logger } from '../../Logger/Logger';
import { getSkillAmount } from '../Skills/SkillAmount';
import type { SkillsGroup } from '../Skills/SkillsGroup';
import { EffectApply } from './EffectApply';
import type { FightAction } from './FightAction';
import type { FightActionResult } from './FightActionResultTypes';
import type { FightMember } from './FightMember';
import { SkillTargeting } from './SkillTargeting';

export class FightActionSkill {
	/**
	 * A fightmember uses a skill.
	 * @param action
	 * @param skillData
	 */
	public static execute(action: FightAction, skillData: SkillsGroup): FightActionResult {
		let skill = skillProperties[skillData.id];

		let targets;

		// Sort by lowest hp for healing, by fastest speed by default
		if (skill.type === SkillType.HealOther) {
			targets = SkillTargeting.getTargets(action, 'hp');
		} else {
			targets = SkillTargeting.getTargets(action, 'speed');
		}

		let result: FightActionResult = {
			type: skill.single ? FightActionType.Magic : FightActionType.MultiMagic,
			source: action.member.base.id,
			target: action.target ? action.target.base.id : 0,
			detail: skill.id,
			stats: [action.member],
			magic: [],
			data: null,
		};

		switch (skill.type) {
			case SkillType.Fire:
			case SkillType.Ice:
			case SkillType.Evil:
			case SkillType.Flash:
			case SkillType.MultiShot:
			case SkillType.Blizzard:
				targets.forEach(target => this.executeMagicSkill(result, target, skillData));
				break;
			case SkillType.Frailty:
			case SkillType.Poison:
			case SkillType.Chaos:
			case SkillType.Hypnotize:
			case SkillType.Stun:
			case SkillType.PurgeChaos:
			case SkillType.UnStun:
			case SkillType.Speed:
			case SkillType.Death:
			case SkillType.Enhance:
			case SkillType.Protect:
			case SkillType.Reflect:
			case SkillType.Repel:
				targets.forEach(target => this.executeEffectSkill(result, target, skillData));
				break;
			case SkillType.HealOther:
				targets.forEach(target => this.executeHealSkill(result, target, skillData));
				break;
			case SkillType.Drain:
				targets.forEach(target => this.executeDrainSkill(result, target, skillData));
				break;
		}

		return result;
	}

	/**
	 * Apply attack skills to the target and update the result.
	 * @param result
	 * @param source
	 * @param target
	 * @param skillData
	 * @param skillType
	 */
	private static executeMagicSkill(
		result: FightActionResult,
		target: FightMember,
		skillData: SkillsGroup,
	): void {
		const skill = skillProperties[skillData.id];

		let baseDamage = skillData.amount || 50;

		// Factor in int as a multiplier
		const mpPoints = result.stats[0].base.fightData.stats.mp.points;
		const mpMultiplier = 1 + mpPoints / 400;
		let damage = baseDamage * mpMultiplier;

		// Apply resistance based on skill type
		const resistMap: Record<SkillType, number> = {
			[SkillType.Fire]: target.base.fightStats.totals.resists.fireResist,
			[SkillType.Ice]: target.base.fightStats.totals.resists.iceResist,
			[SkillType.Flash]: target.base.fightStats.totals.resists.flashResist,
			[SkillType.Evil]: target.base.fightStats.totals.resists.evilResist,
			[SkillType.MultiShot]: target.base.fightStats.totals.resists.meleeResist,
			[SkillType.Blizzard]: target.base.fightStats.totals.resists.meleeResist,
		} as Record<SkillType, number>;

		const resistPercent = resistMap[skill.type] ?? 0;
		damage = Math.max(1, Math.floor(damage * (1 - resistPercent / 100)));

		let repel = 0;

		const reflectChance = target.base.fightStats.totals.resists.magicReflect;
		if (Math.random() * 100 < reflectChance) {
			repel = Math.floor(
				damage * (target.base.fightStats.totals.resists.magicReflectDamage / 100),
			);
			// Apply reflected damage to the source
			result.stats[0].base.fightData.stats.addHp(-repel);
			Logger.info(
				`${result.stats[0].base.name} was reflected ${repel} damage by ${target.base.name}`,
			);
			// Check if source dies from reflect
			if (result.stats[0].base.fightData.stats.currentHp === 0) {
				result.stats[0].effect.value = FightEffect.Dead;
			}
		}
		target.base.fightData.stats.addHp(-damage);

		// Clear hypnotize effect when taking damage
		if (target.effect.has(FightEffect.Hypnotize)) {
			target.effect.remove(FightEffect.Hypnotize);
			target.effectCounters.set(FightEffect.Hypnotize, 0);
		}

		// TODO use copy of hp in FightMember, update dead-status in setter
		if (target.base.fightData.stats.currentHp === 0) target.effect.value = FightEffect.Dead;

		result.magic?.push({
			id: target.base.id,
			damage: damage,
			repel: repel,
		});

		result.stats.push(target);
	}

	/**
	 * Apply effect skills and update the result.
	 * @param result
	 * @param target
	 * @param skillData
	 */
	private static executeEffectSkill(
		result: FightActionResult,
		target: FightMember,
		skillData: SkillsGroup,
	): void {
		let chance = 0.95;

		const skill = skillProperties[skillData.id];

		// These skills should always succeed
		if (
			[
				SkillType.Enhance,
				SkillType.Protect,
				SkillType.Repel,
				SkillType.Reflect,
				SkillType.Speed,
			].includes(skill.type)
		) {
			chance = 1;
		} else {
			// Exponential bonus based on skill level
			const skillLevelBonus = Math.pow(Math.max(0, skillData.level - 1), 1.5) * 0.025;
			chance += skillLevelBonus;

			// Int gives a small bonus
			const mpPoints = result.stats[0].base.fightData.stats.mp.points;
			const mpMultiplier = mpPoints / 2000;
			chance += mpMultiplier;

			// Resistance reduces chance
			const effectResistMap: Record<SkillType, number> = {
				[SkillType.Frailty]: target.base.fightStats.totals.resists.frailtyResist,
				[SkillType.Poison]: target.base.fightStats.totals.resists.poisonResist,
				[SkillType.Hypnotize]: target.base.fightStats.totals.resists.hypnotizeResist,
				[SkillType.Chaos]: target.base.fightStats.totals.resists.chaosResist,
				[SkillType.Death]: target.base.fightStats.totals.resists.deathResist,
			} as Record<SkillType, number>;

			const resistPercent = effectResistMap[skill.type] ?? 0;
			chance = Math.max(0.05, chance - resistPercent / 100);
		}
		if ([SkillType.Chaos, SkillType.Hypnotize, SkillType.Stun].includes(skill.type)) {
			if (Math.random() < chance) {
				this.setEffect(target, skillData);
			}
			result.stats.push(target);
			return;
		}

		// Apply initial poison damage
		if (skill.type === SkillType.Poison) {
			const basePercent = 15; // Base 15% of max HP
			const levelBonus = (skillData.level - 1) * 2; // Each level adds 2%
			const poisonPercent = basePercent + levelBonus;

			const damage = Math.floor((target.base.fightData.stats.hp.stat * poisonPercent) / 100);
			target.base.fightData.stats.addHp(-damage);
			if (target.effect.has(FightEffect.Hypnotize)) {
				target.effect.remove(FightEffect.Hypnotize);
				target.effectCounters.set(FightEffect.Hypnotize, 0);
			}

			if (target.base.fightData.stats.currentHp === 0) {
				target.effect.value = FightEffect.Dead;
			}

			result.magic?.push({
				id: target.base.id,
				damage,
				repel: 0,
			});

			this.setEffect(target, skillData);
			result.stats.push(target);
			return;
		}
		// Enhance
		if (skill.type === SkillType.Enhance) {
			// Base amounts
			const baseBonus = 15;
			const baseComboHits = 3;

			// Level scaling: +3% per level for rates/damages, +1 per level for combo hits
			const levelBonus = (skillData.level - 1) * 3;
			const comboHitBonus = skillData.level - 1;

			// Apply enhancements with level scaling
			target.base.fightStats.totals.resists.berserkRate += baseBonus + levelBonus;
			target.base.fightStats.totals.resists.berserkDamage += baseBonus + levelBonus;
			target.base.fightStats.totals.resists.pierce += baseBonus + levelBonus;
			target.base.fightStats.totals.resists.pierceDamage += baseBonus + levelBonus;
			target.base.fightStats.totals.resists.comboRate += baseBonus + levelBonus;
			target.base.fightStats.totals.resists.comboHit += baseComboHits + comboHitBonus;
			target.base.fightStats.totals.resists.counterAttackRate += baseBonus + levelBonus;
			target.base.fightStats.totals.resists.counterAttackDamage += baseBonus + levelBonus;

			this.setEffect(target, skillData);
			result.stats.push(target);
			return;
		}
		// Protect
		if (skill.type === SkillType.Protect) {
			// Base amounts
			const baseResist = 15;

			// Level scaling: +3% per level
			const levelBonus = (skillData.level - 1) * 3;
			const totalResist = baseResist + levelBonus;

			// Magic resistances
			target.base.fightStats.totals.resists.fireResist += totalResist;
			target.base.fightStats.totals.resists.iceResist += totalResist;
			target.base.fightStats.totals.resists.flashResist += totalResist;
			target.base.fightStats.totals.resists.evilResist += totalResist;

			// Status effect resistances
			target.base.fightStats.totals.resists.poisonResist += totalResist;
			target.base.fightStats.totals.resists.stunResist += totalResist;
			target.base.fightStats.totals.resists.hypnotizeResist += totalResist;
			target.base.fightStats.totals.resists.chaosResist += totalResist;
			target.base.fightStats.totals.resists.frailtyResist += totalResist;
			target.base.fightStats.totals.resists.deathResist += totalResist;

			this.setEffect(target, skillData);
			result.stats.push(target);
			return;
		}
		// Repel
		if (skill.type === SkillType.Repel) {
			// Base reflect percentages by rank (lower for multi-target)
			const basePercentByRank = {
				1: 30, // Rank 1: 30% (single)
				2: 25, // Rank 2: 25% (multi)
				3: 45, // Rank 3: 45% (single)
				4: 40, // Rank 4: 40% (multi)
			};

			const basePercent = basePercentByRank[skill.rank];
			const levelBonus = (skillData.level - 1) * 3; // Each level adds 3%
			const reflectPercent = basePercent + levelBonus;

			// Apply magic reflect stats
			target.base.fightStats.totals.resists.magicReflect += reflectPercent;
			target.base.fightStats.totals.resists.magicReflectDamage += reflectPercent;

			this.setEffect(target, skillData);
			result.stats.push(target);
			return;
		}
		// Reflect
		if (skill.type === SkillType.Reflect) {
			// Base reflect percentages by rank (lower for multi-target)
			const basePercentByRank = {
				1: 30, // Rank 1: 30% (single)
				2: 25, // Rank 2: 25% (multi)
				3: 45, // Rank 3: 45% (single)
				4: 40, // Rank 4: 40% (multi)
			};

			const basePercent = basePercentByRank[skill.rank];
			const levelBonus = (skillData.level - 1) * 3; // Each level adds 3%
			const reflectPercent = basePercent + levelBonus;

			// Apply magic reflect stats
			target.base.fightStats.totals.resists.meleeReflect += reflectPercent;
			target.base.fightStats.totals.resists.meleeReflectDamage += reflectPercent;

			this.setEffect(target, skillData);
			result.stats.push(target);
			return;
		}
		// Speed
		if (skill.type === SkillType.Speed) {
			const baseSpeedByRank = {
				1: 50, // Rank 1: +50 speed (single)
				2: 35, // Rank 2: +35 speed (multi)
				3: 100, // Rank 3: +100 speed (single)
				4: 75, // Rank 4: +75 speed (multi)
			};

			const baseSpeed = baseSpeedByRank[skill.rank];
			const levelBonus = (skillData.level - 1) * 15; // Each level adds 15 speed
			const speedBoost = baseSpeed + levelBonus;

			// Directly add the speed boost
			target.base.fightStats.totals.speed += speedBoost;

			// The speed increase will affect future turn order through sortBySpeed()
			this.setEffect(target, skillData);
			result.stats.push(target);
			Logger.info(
				`${target.base.name} speed boosted by ${speedBoost} to ${target.base.fightStats.totals.speed}`,
			);
			return;
		}
	}

	/**
	 * Apply the effect of a skill.
	 * @param member
	 * @param skillData
	 */
	private static setEffect(member: FightMember, skillData: SkillsGroup): void {
		let skill = skillProperties[skillData.id];
		let rounds = getSkillAmount(skillData.id)[skillData.level - 1];

		// Handle special cases first
		if (skill.type === SkillType.PurgeChaos) {
			member.effect.remove(FightEffect.Chaos);
			member.effectCounters.set(FightEffect.Chaos, 0);
			return;
		}
		if (skill.type === SkillType.UnStun) {
			member.effect.remove(FightEffect.Stun);
			member.effectCounters.set(FightEffect.Stun, 0);
			return;
		}

		// Get the corresponding effect for this skill
		const effect = EffectApply.skillEffectMap[skill.type];

		if (!effect) {
			Logger.warn(`No effect mapping found for skill type: ${skill.type}`);
			return;
		}

		// Use EffectApply for all effects
		let applied = EffectApply.apply(member.effect, effect);
		if (applied) {
			member.effectCounters.set(effect, rounds);
			member.removeUnusedCounters();
		}
	}

	/**
	 * Apply healing to the target and update the result.
	 * @param result
	 * @param target
	 * @param skillData
	 */
	private static executeHealSkill(
		result: FightActionResult,
		target: FightMember,
		skillData: SkillsGroup,
	): void {
		const skill = skillProperties[skillData.id];

		// Base percentages by rank
		const basePercentByRank = {
			1: 25, // Rank 1: 25% (single)
			2: 15, // Rank 2: 15% (multi)
			3: 40, // Rank 3: 40% (single)
			4: 25, // Rank 4: 25% (multi)
		};

		const basePercent = basePercentByRank[skill.rank];
		const levelBonus = (skillData.level - 1) * 2; // Each level adds 2%
		const healPercent = basePercent + levelBonus;

		const healing = Math.floor((target.base.fightData.stats.hp.stat * healPercent) / 100);
		//revive if dead
		if (target.base.fightData.stats.currentHp === 0) {
			target.base.fightData.stats.addHp(healing);
			target.effect.value = FightEffect.None;
		} else {
			target.base.fightData.stats.addHp(healing);
		}

		result.magic?.push({
			id: target.base.id,
			damage: healing,
			repel: 0,
		});

		result.stats.push(target);
	}

	/**
	 * Apply HP and MP drain to the target and update the result.
	 * @param result
	 * @param target
	 * @param skillData
	 */
	private static executeDrainSkill(
		result: FightActionResult,
		target: FightMember,
		skillData: SkillsGroup,
	): void {
		const skill = skillProperties[skillData.id];

		// Base drain percentages by rank (lower for multi-target)
		const basePercentByRank = {
			1: 25, // Rank 1: 25% (single)
			2: 20, // Rank 2: 20% (multi)
			3: 40, // Rank 3: 40% (single)
			4: 35, // Rank 4: 35% (multi)
		};

		const basePercent = basePercentByRank[skill.rank];
		const levelBonus = (skillData.level - 1) * 2; // Each level adds 2%
		const drainPercent = basePercent + levelBonus;

		// Calculate HP and MP drain
		const hpDrain = Math.floor((target.base.fightData.stats.hp.stat * drainPercent) / 100);
		const mpDrain = Math.floor((target.base.fightData.stats.mp.stat * drainPercent) / 100);

		// Apply drains
		target.base.fightData.stats.addHp(-hpDrain);
		target.base.fightData.stats.addMp(-mpDrain);

		// Clear hypnotize effect when taking damage
		if (target.effect.has(FightEffect.Hypnotize)) {
			target.effect.remove(FightEffect.Hypnotize);
			target.effectCounters.set(FightEffect.Hypnotize, 0);
		}

		// Check for death
		if (target.base.fightData.stats.currentHp === 0) {
			target.effect.value = FightEffect.Dead;
		}

		result.magic?.push({
			id: target.base.id,
			damage: hpDrain,
			repel: 0,
		});

		result.stats.push(target);
	}
}
