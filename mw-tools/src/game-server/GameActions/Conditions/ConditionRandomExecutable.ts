import { Random } from '../../Utils/Random';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionRandom } from '../GameConditionTypes';

/**
 * Has a percentage chance of returning true.
 */
export class ConditionRandomExecutable extends GameConditionExecutable<unknown> {
	private chance: number;

	protected constructor(protected override readonly condition: GameConditionRandom) {
		super(condition);
		this.chance = condition.chance / 100;
	}

	public static parse(condition: GameConditionRandom): ConditionRandomExecutable {
		return new this(condition);
	}

	protected run(): boolean {
		return Random.chance(this.chance);
	}
}
