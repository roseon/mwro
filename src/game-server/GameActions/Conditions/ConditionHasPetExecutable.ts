import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionHasPet } from '../GameConditionTypes';
import { getPetTemplate } from '../../Data/PetTemplates';

/**
 * Checks if the player has a pet.
 * Can check for specific pet by ID, template, or minimum loyalty/intimacy levels.
 */
export class ConditionHasPetExecutable extends GameConditionExecutable<ClientActionContext> {
	protected constructor(protected override readonly condition: GameConditionHasPet) {
		super(condition);
	}

	public static parse(condition: GameConditionHasPet): ConditionHasPetExecutable {
		return new this(condition);
	}

	protected run({ player }: ClientActionContext): boolean {
		// If no pets at all, return false
		if (player.pets.length === 0) return false;

		// If checking for specific pet ID
		if (this.condition.petId) {
			return player.pets.some(pet => pet.id === this.condition.petId);
		}

		// If checking for specific pet template
		if (this.condition.template) {
			const template = getPetTemplate(this.condition.template);
			return player.pets.some(pet => pet.file === template.file);
		}

		// If checking for minimum loyalty
		if (this.condition.minLoyalty) {
			const hasLoyalty = player.pets.some(pet => pet.loyalty >= this.condition.minLoyalty!);
			if (!hasLoyalty) return false;
		}

		// If checking for minimum intimacy
		if (this.condition.minIntimacy) {
			const hasIntimacy = player.pets.some(
				pet => pet.intimacy >= this.condition.minIntimacy!,
			);
			if (!hasIntimacy) return false;
		}

		// If we get here, either no specific conditions were set (checking for any pet)
		// or all conditions were met
		return true;
	}
}
