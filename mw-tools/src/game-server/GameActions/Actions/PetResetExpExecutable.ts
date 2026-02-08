import { Level } from '../../GameState/Level';
import { PetPackets } from '../../Responses/PetPackets';
import { Skills, eligibleSkills } from '../../GameState/Skills/Skills';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionPetResetExp } from '../GameActionTypes';

/**
 * Reset the active pet's exp and level.
 */
export class PetResetExpExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionPetResetExp) {
		super(action);
	}

	public static parse(action: GameActionPetResetExp): PetResetExpExecutable {
		return new this(action);
	}

	protected run({ client, player }: ClientActionContext): void {
		const pet = player.activePet;
		if (!pet) return;

		pet.level = Level.fromLevel(1, pet.level.reborn);
		pet.fightData.stats.autoLevelsApplied = 0;
		pet.fightData.stats.unused = 4;

		pet.fightData.skills = Skills.fromJson(eligibleSkills(pet.skillList, pet.level.level));
		pet.fightStats.update(pet);
		pet.fightData.stats.currentHp = pet.fightStats.totals.hp;
		pet.fightData.stats.currentMp = pet.fightStats.totals.mp;

		client.write(PetPackets.level(pet));
		client.write(PetPackets.skills(pet));
		client.write(PetPackets.healHp(pet));
		client.write(PetPackets.healMp(pet));
	}
}
