import { PlayerCollection } from '../../Database/Collections/Player/PlayerCollection';
import type { PlayerJsonCollection } from '../../Database/Collections/Player/PlayerJson';
import { CharacterGender, CharacterRace } from '../../Enums/CharacterClass';
import { MapID } from '../../Enums/MapID';
import { Skill } from '../../Enums/Skill';
import { Point } from '../../Utils/Point';
import { Random } from '../../Utils/Random';
import type { IndividualMapDataJson } from '../Individual/IndividualMapData';
import { Resist } from '../Resist';
import type { SkillsGroupJson } from '../Skills/SkillsGroup';
import type { StatRates } from '../Stats/StatRates';
import type { StatsJson } from '../Stats/Stats';
import type { PlayerJson } from './Player';
import type { PlayerTitlesJson } from './PlayerTitles';

let id: number | null = null;

/**
 * Class used for creating a new player.
 */
export abstract class PlayerCreator {
	public static async create(
		race: CharacterRace,
		gender: CharacterGender,
		name: string,
	): Promise<PlayerJson> {
		if (!id) {
			let playerCollection = PlayerCollection.getInstance();
			id = await playerCollection.maxKey();
		}

		id++;

		return {
			name,
			race,
			gender,
			id,
			file: race * 2 + gender + 1,
			fightData: {
				stats: this.createStats(race),
				skills: this.createSkills(race, gender),
				resist: Resist.createForRaceGender(race, gender),
			},
			mapData: this.getStartLocation(),
			titles: this.getStartTitle(),
		};
	}

	public static fromJson(user: PlayerJsonCollection): PlayerJson {
		return {
			name: user.name,
			race: user.race,
			gender: user.gender,
			id: user.id,
			file: user.file,
			fightData: { stats: user.stats, skills: user.skills },
			mapData: {
				map: user.mapId,
				direction: user.mapDirection,
				point: user.mapPoint,
			},
			pendingMail: user.pendingMail,
			titles: user.titles,
		};
	}

	private static createStats(race: CharacterRace): StatsJson {
		let rates = this.getStatRates(race);

		return {
			hp: { rate: rates.sta, pointsBase: 1 },
			mp: { rate: rates.int, pointsBase: 1 },
			attack: { rate: rates.str, pointsBase: 1 },
			speed: { rate: rates.agi, pointsBase: 1 },
			currentHp: 0,
			currentMp: 0,
			growthRate: 1,
			unused: 4,
		};
	}

	private static getStatRates(race: CharacterRace): StatRates {
		switch (race) {
			case CharacterRace.Human:
				return { sta: 186, int: 232, str: 22, agi: 86, growthRate: 1 };
			case CharacterRace.Centaur:
				return { sta: 109, int: 256, str: 18, agi: 113, growthRate: 1 };
			case CharacterRace.Mage:
				return { sta: 120, int: 322, str: 16, agi: 105, growthRate: 1 };
			case CharacterRace.Borg:
				return { sta: 137, int: 182, str: 32, agi: 91, growthRate: 1 };
		}
	}

	private static createSkills(race: CharacterRace, gender: CharacterGender): SkillsGroupJson[] {
		let skills: SkillsGroupJson[] = [];

		switch (race) {
			case CharacterRace.Human:
				if (gender == CharacterGender.Male) skills.push({ id: Skill.FrailtyI, exp: 0 });
				else if (gender == CharacterGender.Female)
					skills.push({ id: Skill.PoisonI, exp: 0 });

				skills.push(
					{ id: Skill.ChaosI, exp: 0 },
					{ id: Skill.HypnotizeI, exp: 0 },
					{ id: Skill.StunI, exp: 0 },
				);

				break;
			case CharacterRace.Centaur:
				if (gender == CharacterGender.Male)
					skills.push(
						{ id: Skill.PurgeChaosI, exp: 0 },
						{ id: Skill.MultiShotI, exp: 0 },
					);
				else if (gender == CharacterGender.Female)
					skills.push({ id: Skill.UnStunI, exp: 0 }, { id: Skill.BlizzardI, exp: 0 });

				skills.push({ id: Skill.SpeedI, exp: 0 }, { id: Skill.HealOtherI, exp: 0 });

				break;
			case CharacterRace.Mage:
				if (gender == CharacterGender.Male) skills.push({ id: Skill.FireI, exp: 0 });
				else if (gender == CharacterGender.Female) skills.push({ id: Skill.IceI, exp: 0 });

				skills.push(
					{ id: Skill.EvilI, exp: 0 },
					{ id: Skill.FlashI, exp: 0 },
					{ id: Skill.DeathI, exp: 0 },
				);

				break;
			case CharacterRace.Borg:
				if (gender == CharacterGender.Male) skills.push({ id: Skill.EnhanceI, exp: 0 });
				else if (gender == CharacterGender.Female)
					skills.push({ id: Skill.ProtectI, exp: 0 });

				skills.push(
					{ id: Skill.DrainI, exp: 0 },
					{ id: Skill.ReflectI, exp: 0 },
					{ id: Skill.RepelI, exp: 0 },
				);

				break;
		}

		return skills;
	}

	private static getStartLocation(): IndividualMapDataJson {
		return {
			map: MapID.SkyPassage,
			direction: Random.int(0, 8),
			point: new Point(210, 240).getRandomNearby(0, 10).toMapPoint(),
		};
	}

	private static getStartTitle(): PlayerTitlesJson {
		return {
			title: null,
			titles: [1],
		};
	}
}
