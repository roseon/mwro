import { FightEffect } from '../../Enums/FightEffect';
import type { FightMember } from './FightMember';

/**
 * Execute a melee FightAction.
 * @param source
 * @param target
 */
export function executeMeleeAction(source: FightMember, target: FightMember): Buffer {
	let counter = 0;
	let reflect = 0;

	if (calculateMiss(source, target)) return getDataMelee(false, 0, reflect, counter);

	let damage = calculateMeleeDamage(source, target);

	damage = calculateCritical(damage, source, target);

	// Calculate reflection damage
	if (Math.random() < target.base.fightStats.totals.resists.meleeReflect / 100) {
		reflect = Math.round(
			damage * (target.base.fightStats.totals.resists.meleeReflectDamage / 100),
		);
		source.base.fightData.stats.addHp(-reflect);
	}

	target.base.fightData.stats.addHp(-damage);
	if (target.effect.has(FightEffect.Hypnotize)) {
		target.effect.remove(FightEffect.Hypnotize);
		target.effectCounters.set(FightEffect.Hypnotize, 0);
	}

	return getDataMelee(true, damage, reflect, counter);
}

/**
 * Execute a melee combo FightAction.
 * @param combos
 * @param source
 * @param target
 */
export function executeMeleeComboAction(
	combos: number,
	source: FightMember,
	target: FightMember,
): Buffer {
	let totalDamage = 0;
	let comboData: [number, number, number][] = [];
	let damage = calculateMeleeDamage(source, target);

	while (combos--) {
		let miss = calculateMiss(source, target);
		let reflect = 0;
		let counter = 0;

		let critDamage = calculateCritical(damage, source, target);

		// Calculate reflection damage for each hit
		if (!miss && Math.random() < target.base.fightStats.totals.resists.meleeReflect / 100) {
			reflect = Math.round(
				critDamage * (target.base.fightStats.totals.resists.meleeReflectDamage / 100),
			);
			source.base.fightData.stats.addHp(-reflect);
		}

		comboData.push([miss ? 0 : critDamage, reflect, counter]);

		if (!miss) totalDamage += critDamage;

		damage = Math.max(Math.round(damage / 2), 1);
	}

	target.base.fightData.stats.addHp(-totalDamage);

	return getDataMeleeCombo(comboData);
}

/**
 * Calculates the melee damage the source would do against the target.
 * Does not include: critical, combo, missing.
 * @param source
 * @param target
 */
function calculateMeleeDamage(source: FightMember, target: FightMember): number {
	let atk = source.base.fightStats.totals.attack;

	// TODO: Generic calculation
	let def =
		target.base.fightStats.totals.resists.defense +
		target.base.fightStats.totals.resists.meleeResist;

	/* TODO:
	Source:
		- Resist.Berserk
		- Status: Enhance
	Enemy:
		- Status: Protect
	Both:
		- Equipment
		- Shapeshift
	*/

	// If damage is less than 0 then return 0 instead
	if (atk - def <= 0) return 0;

	return atk - def;
}

/**
 * Returns true (miss) or false (hit) based on the stats.
 * @param source
 * @param target
 */
function calculateMiss(source: FightMember, target: FightMember): boolean {
	let hitRate = source.base.fightStats.totals.resists.hitRate / 100;
	let dodgeRate = target.base.fightStats.totals.resists.dodgeRate / 100;
	let dodgeAction = target.base.fightStats.totals.resists.dodgeAction / 100;
	let hitChance = 0.9 * (hitRate - dodgeRate - dodgeAction);

	return Math.random() > hitChance;
}

/**
 * Returns the combo count based on the stats, 1 means no combo.
 * @param source
 */
export function calculateComboCount(source: FightMember): number {
	let rate = source.base.fightStats.totals.resists.comboRate / 100;
	let hit = source.base.fightStats.totals.resists.comboHit + 1;

	if (hit > 7) hit = 7;

	return Math.random() < rate ? hit : 1;
}

/**
 * Melee specific data.
 */
function getDataMelee(hit: boolean, damage: number, reflect: number, counter: number): Buffer {
	let data = Buffer.alloc(13);
	data.writeUInt8(hit ? 1 : 0, 0);
	data.writeUInt32LE(damage, 1);
	data.writeUInt32LE(reflect, 5);
	data.writeUInt32LE(counter, 9);

	return data;
}

/**
 * Melee combo data.
 * @param combo [damage, reflect, counter][<=7]
 */
function getDataMeleeCombo(combo: [number, number, number][]): Buffer {
	let data = Buffer.alloc(1 + 12 * combo.length);
	data.writeUInt8(combo.length, 0);

	for (let i = 0; i < combo.length; i++) {
		let offset = 1 + 12 * i;
		data.writeUInt32LE(combo[i][0], offset);
		data.writeUInt32LE(combo[i][1], offset + 4);
		data.writeUInt32LE(combo[i][2], offset + 8);
	}

	return data;
}

/**
 * Returns the amount of damage based on if it was a critical or not.
 * @param damage
 * @param source
 * @param target
 */
export function calculateCritical(
	damage: number,
	source: FightMember,
	target: FightMember,
): number {
	// TODO Generic calculation
	let critRate = source.base.fightStats.totals.resists.criticalRate / 100;
	let critResist = target.base.fightStats.totals.resists.criticalResist / 100;

	if (Math.random() + critRate - critResist > 1) {
		damage = damage * (2 + source.base.fightStats.totals.resists.criticalDamage);
	}

	return damage;
}
