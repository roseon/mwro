import { getPetTemplate } from '../../Data/PetTemplates';
import { PetPackets } from '../../Responses/PetPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionPetResetGrowth } from '../GameActionTypes';
import { resolveRandomStatRates } from '../../GameState/Stats/StatRates';

/**
 * Reset the active pet's growth rate to template values.
 */
export class PetResetGrowthExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionPetResetGrowth) {
		super(action);
	}

	public static parse(action: GameActionPetResetGrowth): PetResetGrowthExecutable {
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
		const stats = pet.fightData.stats;

		stats.growthRate = statRates.growthRate;
		stats.hp.growthRate = statRates.growthRate;
		stats.mp.growthRate = statRates.growthRate;
		stats.attack.growthRate = statRates.growthRate;
		stats.speed.growthRate = statRates.growthRate;

		pet.fightStats.update(pet);
		stats.currentHp = pet.fightStats.totals.hp;
		stats.currentMp = pet.fightStats.totals.mp;

		client.write(PetPackets.stats(pet));
		client.write(PetPackets.attributes(pet));
		client.write(PetPackets.healHp(pet));
		client.write(PetPackets.healMp(pet));
	}
}
