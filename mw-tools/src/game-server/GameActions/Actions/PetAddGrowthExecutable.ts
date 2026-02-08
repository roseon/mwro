import { PetPackets } from '../../Responses/PetPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionPetAddGrowth } from '../GameActionTypes';

/**
 * Add growth rate to the active pet.
 */
export class PetAddGrowthExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionPetAddGrowth) {
		super(action);
	}

	public static parse(action: GameActionPetAddGrowth): PetAddGrowthExecutable {
		return new this(action);
	}

	protected run({ client, player }: ClientActionContext): void {
		const pet = player.activePet;
		if (!pet) return;

		const stats = pet.fightData.stats;
		stats.growthRate += this.action.amount;
		stats.hp.growthRate = stats.growthRate;
		stats.mp.growthRate = stats.growthRate;
		stats.attack.growthRate = stats.growthRate;
		stats.speed.growthRate = stats.growthRate;

		pet.fightStats.update(pet);
		stats.currentHp = pet.fightStats.totals.hp;
		stats.currentMp = pet.fightStats.totals.mp;

		client.write(PetPackets.stats(pet));
		client.write(PetPackets.attributes(pet));
		client.write(PetPackets.healHp(pet));
		client.write(PetPackets.healMp(pet));
	}
}
