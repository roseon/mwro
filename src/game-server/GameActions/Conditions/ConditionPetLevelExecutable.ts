import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionPetLevel } from '../GameConditionTypes';

/**
 * Checks if the player's active pet is at a certain level.
 * Default is inclusive but can be set with inclusive flag
 */
export class ConditionPetLevelExecutable extends GameConditionExecutable<ClientActionContext> {
	private min: number;
	private max: number | null;

	protected constructor(protected override readonly condition: GameConditionPetLevel) {
		super(condition);
		this.min = condition.min ?? 0;
		this.max = condition.max ?? null;
		if (condition.inclusive || condition.inclusive === undefined) {
			this.min -= 1;
			if (this.max) this.max += 1;
		}
	}

	public static parse(condition: GameConditionPetLevel): ConditionPetLevelExecutable {
		return new this(condition);
	}

	protected run({ player }: ClientActionContext): boolean {
		const pet = player.activePet;
		if (!pet) return false;

		if (this.max) {
			return this.min < pet.level.level && pet.level.level < this.max;
		} else {
			return this.min < pet.level.level;
		}
	}
}
