import { skillProperties } from '../../Data/SkillProperties';
import { FightActionCommand } from '../../Enums/FightActionCommand';
import { FightEffect } from '../../Enums/FightEffect';
import { SkillType } from '../../Enums/SkillType';
import type { SkillsGroup } from '../Skills/SkillsGroup';
import type { FightAction } from './FightAction';
import { FightMember } from './FightMember';

export class SkillTargeting {
	/**
	 * Get a list of targets for the given action.
	 * Targets faster characters first.
	 * @param action
	 */
	public static getTargets(action: FightAction, sort: 'speed' | 'hp'): FightMember[] {
		if (action.type !== FightActionCommand.Skill) return [];

		let skillData = action.member.base.fightData.skills.skillData.find(
			s => s.id === action.detail,
		);

		if (!skillData) return [];

		let targetEnemey = skillProperties[skillData.id].enemy;
		let count = this.getCount(skillData) - 1; // Remove 1 for main target
		let skipDead = this.shouldSkipDead(skillData);
		let skipStun = this.shouldSkipStun(skillData);

		// Copy members to allow sorting without changing original sort
		let possibleTargets: FightMember[] = Object.assign(
			[],
			action.fight.getSide(action.member, targetEnemey),
		);

		if (sort == 'hp') possibleTargets.sort(FightMember.compareHp);

		let targets: FightMember[] = [];

		if (action.target) {
			// If target is dead and skill targets dead
			if (!skipDead && action.target.effect.has(FightEffect.Dead))
				targets.push(action.target);
			// If target is stunned and skill targets stunned
			else if (!skipStun && action.target.effect.has(FightEffect.Stun))
				targets.push(action.target);
			// If target is still alive and not stunned
			else if (!action.target.effect.any(FightEffect.Stun | FightEffect.Dead))
				targets.push(action.target);
		}

		for (let pTarget of possibleTargets) {
			if (count <= 0) break;

			if (pTarget === action.target) continue;

			// TODO Should this skip over the target or just not damage it.
			if (skipDead && pTarget.effect.has(FightEffect.Dead)) continue;
			if (skipStun && pTarget.effect.has(FightEffect.Stun)) continue;

			targets.push(pTarget);
			--count;
		}

		return targets;
	}

	/**
	 * Get the number of people targetted by this skill.
	 * @param skillData
	 */
	private static getCount(skillData: SkillsGroup): number {
		return skillData.targets;
	}

	/**
	 * Whether or not dead characters are skipped over.
	 * @todo do skills actually skip over dead characters or just not affect them?
	 * @param skillData
	 */
	private static shouldSkipDead(skillData: SkillsGroup): boolean {
		let skill = skillProperties[skillData.id];
		return skill.type !== SkillType.HealOther;
	}

	/**
	 * Whether or not stunned characters are skipped over.
	 * @param skillData
	 */
	private static shouldSkipStun(skillData: SkillsGroup): boolean {
		let skill = skillProperties[skillData.id];
		return ![SkillType.Stun, SkillType.UnStun].includes(skill.type);
	}
}
