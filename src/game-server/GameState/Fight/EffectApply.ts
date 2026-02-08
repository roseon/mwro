import { FightEffect } from '../../Enums/FightEffect';
import { SkillType } from '../../Enums/SkillType';
import { Bitfield } from '../../Utils/Bitfield';

const negativeEffects = [
	FightEffect.Frailty,
	FightEffect.Poison,
	FightEffect.Chaos,
	FightEffect.Hypnotize,
	FightEffect.Stun,
	FightEffect.Death,
];

const positiveEffects = [
	FightEffect.Speed,
	FightEffect.Enhance,
	FightEffect.Protect,
	FightEffect.Reflect,
	FightEffect.Repel,
];

export class EffectApply {
	public static readonly all: FightEffect[] = [...negativeEffects, ...positiveEffects];
	private static readonly negative: Bitfield = new Bitfield(
		negativeEffects.reduce((a, b) => a | b, 0),
	);
	private static readonly positive: Bitfield = new Bitfield(
		positiveEffects.reduce((a, b) => a | b, 0),
	);

	public static readonly skillEffectMap: Partial<Record<SkillType, FightEffect>> = {
		[SkillType.Frailty]: FightEffect.Frailty,
		[SkillType.Poison]: FightEffect.Poison,
		[SkillType.Chaos]: FightEffect.Chaos,
		[SkillType.Hypnotize]: FightEffect.Hypnotize,
		[SkillType.Stun]: FightEffect.Stun,
		[SkillType.Speed]: FightEffect.Speed,
		[SkillType.Death]: FightEffect.Death,
		[SkillType.Enhance]: FightEffect.Enhance,
		[SkillType.Protect]: FightEffect.Protect,
		[SkillType.Reflect]: FightEffect.Reflect,
		[SkillType.Repel]: FightEffect.Repel,
	};

	/**
	 * Applies the effect to the bitfield.
	 * Returns true if it was applied, false if it was blocked by another effect.
	 * @param current
	 * @param effect
	 */
	public static apply(current: Bitfield, effect: FightEffect): boolean {
		// Nothing applies to dead people.
		if (current.has(FightEffect.Dead)) return false;

		// Only stun applies to stun.
		if (current.has(FightEffect.Stun)) return effect === FightEffect.Stun;

		// Adding a negative effect, replace any other negative effect.
		if (this.negative.has(effect)) {
			current.remove(this.negative.value);
			current.add(effect);
			return true;
		}

		// Reflect and repel override each other.
		if (effect === FightEffect.Reflect || effect === FightEffect.Repel) {
			current.remove(FightEffect.Reflect | FightEffect.Repel);
			current.add(effect);
			return true;
		}

		// Adding a positive effect, add to other positive effects.
		if (this.positive.has(effect)) {
			current.add(effect);
			return true;
		}

		return false;
	}
}
