import { Skills, eligibleSkills } from '../../GameState/Skills/Skills';
import { PetPackets } from '../../Responses/PetPackets';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import { Random } from '../../Utils/Random';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionExp } from '../GameActionTypes';

/**
 * Give exp to the player or pet.
 */
export class AddExpExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionExp) {
		super(action);
	}

	public static parse(action: GameActionExp): AddExpExecutable {
		return new this(action);
	}

	protected run(context: ClientActionContext): void {
		let amount = Random.fromJson(this.action.amount);

		if (this.action.pet) this.runPet(context, amount);
		else this.runPlayer(context, amount);
	}

	private runPlayer({ client, player }: ClientActionContext, amount: number): void {
		let levels = player.level.addExp(amount);

		if (levels === 0) client.write(PlayerPackets.experience(player));
		else {
			player.fightData.stats.updateStatPointsForLevel(player.level.level);
			player.fightData.resist.updateResistForLevel(
				player.level.level,
				player.race,
				player.gender,
			);

			if (levels > 0) {
				player.fightStats.update(player);
				const totals = player.fightStats.totals;
				player.fightData.stats.currentHp = totals.hp;
				player.fightData.stats.currentMp = totals.mp;

				client.write(PlayerPackets.healHp(totals.hp));
				client.write(PlayerPackets.healMp(totals.mp));
			}

			client.write(PlayerPackets.level(player));
			client.write(PlayerPackets.resist(player));
		}
	}

	private runPet({ client, player }: ClientActionContext, amount: number): void {
		let pet = player.activePet;

		if (!pet) return;

		let levels = pet.level.addExp(amount);

		if (levels === 0) client.write(PetPackets.experience(pet));
		else {
			let oldSkills = pet.fightData.skills;
			let newSkills = Skills.fromJson(eligibleSkills(pet.skillList, pet.level.level));
			// Only send packet if skills are new
			if (oldSkills !== newSkills) {
				pet.fightData.skills = newSkills;
				client.write(PetPackets.skills(pet));
			}
			pet.fightData.stats.updateStatPointsForLevel(pet.level.level);

			// Heal pet on level up
			pet.fightStats.update(pet);
			pet.fightData.stats.currentHp = pet.fightStats.totals.hp;
			pet.fightData.stats.currentMp = pet.fightStats.totals.mp;

			client.write(PetPackets.level(pet));
		}
	}
}
