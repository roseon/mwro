import { Resist } from '../Resist';
import { Skills } from '../Skills/Skills';
import type { SkillsGroupJson } from '../Skills/SkillsGroup';
import type { StatsJson } from '../Stats/Stats';
import { Stats } from '../Stats/Stats';

export type IndividualFightDataJson = {
	stats: StatsJson;
	skills: SkillsGroupJson[];
	resist?: Partial<Resist>;
};

export abstract class IndividualFightData {
	public stats: Stats;

	public resist: Resist = new Resist();

	public skills: Skills;

	public constructor(json: IndividualFightDataJson) {
		this.stats = new Stats(json.stats);
		this.skills = Skills.fromJson(json.skills);
		if (json.resist) {
			Object.assign(this.resist, json.resist);
		}
	}
}
