import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionRace } from '../GameConditionTypes';

/**
 * Checks if the player's character is of a specific race.
 */
export class ConditionRaceExecutable extends GameConditionExecutable<ClientActionContext> {
	protected constructor(protected override readonly condition: GameConditionRace) {
		super(condition);
	}

	public static parse(condition: GameConditionRace): ConditionRaceExecutable {
		return new this(condition);
	}

	protected run({ player }: ClientActionContext): boolean {
		return player.race === this.condition.race;
	}
}
