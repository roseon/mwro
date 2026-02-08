import { FightEffect } from '../../Enums/FightEffect';
import { Player } from '../Player/Player';
import type { FightMember } from './FightMember';

/**
 * Execute a melee FightAction.
 * @param source
 * @param target
 */
export function executeMeleeAction(
	source: FightMember,
	target: FightMember,
	protectId: number = 0,
): Buffer {
	let counter = 0;
	let reflect = 0;

	if (calculateMiss(source, target)) return getDataMelee(false, 0, reflect, counter, protectId);

	let damage = calculateMeleeDamage(source, target);

	damage = calculateCritical(damage, source, target);

	// Calculate reflection damage
	if (Math.random() < target.base.fightStats.totals.resists.meleeReflect / 100) {
		reflect = Math.round(
			damage * (target.base.fightStats.totals.resists.meleeReflectDamage / 100),
		);
		source.base.fightData.stats.addHp(-reflect, source.base.fightStats.totals.hp);
	}

	target.base.fightData.stats.addHp(-damage, target.base.fightStats.totals.hp);
	if (target.effect.has(FightEffect.Hypnotize)) {
		target.effect.remove(FightEffect.Hypnotize);
		target.effectCounters.set(FightEffect.Hypnotize, 0);
	}

	return getDataMelee(true, damage, reflect, counter, protectId);
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
			source.base.fightData.stats.addHp(-reflect, source.base.fightStats.totals.hp);
		}

		comboData.push([miss ? 0 : critDamage, reflect, counter]);

		if (!miss) totalDamage += critDamage;

		damage = Math.max(Math.round(damage / 2), 1);
	}

	target.base.fightData.stats.addHp(-totalDamage, target.base.fightStats.totals.hp);

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

	// Status: Enhance
	if (source.effect.has(FightEffect.Enhance)) {
		atk = Math.floor(atk * 1.25);
	}

	// Resist.Berserk
	const berserkRate = source.base.fightStats.totals.resists.berserkRate / 100;
	if (Math.random() < berserkRate) {
		const berserkDamage = source.base.fightStats.totals.resists.berserkDamage;
		// Assuming berserkDamage is a percentage add-on (e.g. 150 means 1.5x or +150%?)
		// Typically in MW, it's a multiplier. Let's assume +X%.
		// If berserkDamage is likely around 0-100 or higher.
		atk = Math.floor(atk * (1 + berserkDamage / 100));
	}

	let def =
		target.base.fightStats.totals.resists.defense +
		target.base.fightStats.totals.resists.meleeResist;

	// Status: Protect
	if (target.effect.has(FightEffect.Protect)) {
		def = Math.floor(def * 1.25);
	}

	// Status: Defend (Action)
	if (target.effect.has(FightEffect.Defend)) {
		def = Math.floor(def * 2);
	}

	/* TODO:
	Both:
		- Equipment (Already in fightStats.totals)
		- Shapeshift (Already in fightStats.totals)
	*/

	let damage = Math.max(atk - def, 1);

	// Add random variance 0.9 - 1.1
	damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

	return Math.max(damage, 1);
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
function getDataMelee(
	hit: boolean,
	damage: number,
	reflect: number,
	counter: number,
	protectId: number,
): Buffer {
	let data = Buffer.alloc(17);
	data.writeUInt8(hit ? 1 : 1, 0);
	data.writeUInt32LE(damage, 1);
	data.writeUInt32LE(reflect, 5);
	data.writeUInt32LE(counter, 9);
	data.writeUInt32LE(protectId, 13);

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
