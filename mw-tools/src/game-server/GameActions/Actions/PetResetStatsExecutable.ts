import { getPetTemplate } from '../../Data/PetTemplates';
import { PetPackets } from '../../Responses/PetPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionPetResetStats } from '../GameActionTypes';
import type { BaseStats } from '../../GameState/Stats/StatRates';
import { resolveRandomStatRates } from '../../GameState/Stats/StatRates';

/**
 * Reset the active pet's base stats and growth to template values.
 */
export class PetResetStatsExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionPetResetStats) {
		super(action);
	}

	public static parse(action: GameActionPetResetStats): PetResetStatsExecutable {
		return new this(action);
	}

	protected run({ client, player }: ClientActionContext): void {
		const pet = player.activePet;
		if (!pet) return;

		let template;
		try {
			template = getPetTemplate(pet.file);
		} catch {
			return;
		}

		const statRates = resolveRandomStatRates(template.statRates);
		const build = PetResetStatsExecutable.getBuildForLevel(template.build, pet.level.level);
		const stats = pet.fightData.stats;

		stats.growthRate = statRates.growthRate;
		stats.hp.growthRate = statRates.growthRate;
		stats.mp.growthRate = statRates.growthRate;
		stats.attack.growthRate = statRates.growthRate;
		stats.speed.growthRate = statRates.growthRate;

		stats.hp.rate = statRates.sta;
		stats.mp.rate = statRates.int;
		stats.attack.rate = statRates.str;
		stats.speed.rate = statRates.agi;

		stats.hp.pointsBase = build.sta;
		stats.mp.pointsBase = build.int;
		stats.attack.pointsBase = build.str;
		stats.speed.pointsBase = build.agi;

		stats.hp.pointsAdded = 0;
		stats.mp.pointsAdded = 0;
		stats.attack.pointsAdded = 0;
		stats.speed.pointsAdded = 0;
		stats.hp.statAdded = 0;
		stats.mp.statAdded = 0;
		stats.attack.statAdded = 0;
		stats.speed.statAdded = 0;

		stats.unused = 4;
		stats.autoLevelsApplied = Math.max(0, pet.level.level - 1);

		pet.fightStats.update(pet);
		stats.currentHp = pet.fightStats.totals.hp;
		stats.currentMp = pet.fightStats.totals.mp;

		client.write(PetPackets.stats(pet));
		client.write(PetPackets.attributes(pet));
		client.write(PetPackets.healHp(pet));
		client.write(PetPackets.healMp(pet));
	}

	private static getBuildForLevel(build: BaseStats, level: number): BaseStats {
		const sum = build.sta + build.int + build.str + build.agi;
		const ratio = (level * 4) / sum;

		return {
			sta: level + Math.round(build.sta * ratio),
			int: level + Math.round(build.int * ratio),
			str: level + Math.round(build.str * ratio),
			agi: level + Math.round(build.agi * ratio),
		};
	}
}
