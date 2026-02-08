import type { MonsterTemplate } from '../../Data/MonsterTemplates';
import { GameActionParser } from '../../GameActions/GameActionParser';
import { eligibleSkills } from '../Skills/Skills';
import type { SkillsGroupJson } from '../Skills/SkillsGroup';
import type { BaseStats } from '../Stats/StatRates';
import { resolveRandomStatRates } from '../Stats/StatRates';
import type { MonsterJson } from './Monster';
export abstract class MonsterCreator {
	public static create(json: MonsterTemplate): MonsterJson {
		let statRates = resolveRandomStatRates(json.statRates);
		let stats = this.getBuildForLevel(json.build, json.level);

		let skills: SkillsGroupJson[] = [];

		if (json.skills) skills = eligibleSkills(json.skills, json.level);

		return {
			id: 0x80000000,
			name: json.name,
			file: json.file,
			fightData: {
				stats: {
					hp: { rate: statRates.sta, pointsBase: stats.sta },
					mp: { rate: statRates.int, pointsBase: stats.int },
					attack: { rate: statRates.str, pointsBase: stats.str },
					speed: { rate: statRates.agi, pointsBase: stats.agi },
					growthRate: statRates.growthRate,
				},
				skills: skills,
			},
			onMonsterPlayerFightWin: GameActionParser.parse(json.onMonsterPlayerFightWin),
			onFightClose: GameActionParser.parse(json.onFightClose),
			rewards: json.rewards,
			level: json.level,
		};
	}

	/**
	 * Adjusts the build to the given level.
	 * Note: The result may be off by 1 because of rounding.
	 * I don't care enough right now to fix it.
	 * @param build
	 * @param level
	 */
	private static getBuildForLevel(build: BaseStats, level: number): BaseStats {
		let sum = build.sta + build.int + build.str + build.agi;
		let ratio = (level * 4) / sum;

		return {
			sta: level + Math.round(build.sta * ratio),
			int: level + Math.round(build.int * ratio),
			str: level + Math.round(build.str * ratio),
			agi: level + Math.round(build.agi * ratio),
		};
	}
}
