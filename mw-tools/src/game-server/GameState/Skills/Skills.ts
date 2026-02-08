import type { SkillsGroupJson } from './SkillsGroup';
import { SkillsGroup } from './SkillsGroup';

/**
 * Return possible skills from skill list based on level. Used for Pets and Monsters
 * @param skillList
 * @param level
 * @returns
 */
export function eligibleSkills(skillList: SkillsGroupJson[], level: number): SkillsGroupJson[] {
	let skillLevels = [10, 30, 50, 70];

	let skills: SkillsGroupJson[] = [];

	if (skillList) {
		for (let [i, skillLevel] of skillLevels.entries()) {
			if (skillLevel <= level) {
				skills.push(skillList[i]);
			}
		}
	}

	return skills;
}

export class Skills {
	public skillData: SkillsGroup[] = [];

	private constructor() {}

	/**
	 * Adds a skill to the member if it does not exist, or updates exp if it does
	 * @param id
	 * @param exp
	 */
	public addSkill(id: number, exp: number): void {
		const existingSkillIndex = this.skillData.findIndex(s => s.id === id);
		if (existingSkillIndex !== -1) {
			// Update existing skill
			this.skillData[existingSkillIndex] = SkillsGroup.fromExp(id, exp);
		} else {
			// Add new skill
			let skill = SkillsGroup.fromExp(id, exp);
			this.skillData.push(skill);
		}
	}

	/**
	 * Adds multiple skills to the member if it does not exist
	 * @param skills
	 */
	public addSkills(skills: SkillsGroupJson[]): void {
		for (let skill of skills.values()) {
			this.addSkill(skill.id, skill.exp);
		}
	}

	/**
	 * Turn skills into storable object.
	 * @returns
	 */
	public toJson(): SkillsGroupJson[] {
		let json: SkillsGroupJson[] = [];
		for (let skill of this.skillData) {
			json.push(skill.toJson());
		}
		return json;
	}

	/**
	 * Recreate skills from stored information
	 * @param skills
	 * @returns
	 */
	public static fromJson(skills: SkillsGroupJson[]): Skills {
		let skillData = new Skills();
		skillData.addSkills(skills);
		return skillData;
	}
}
