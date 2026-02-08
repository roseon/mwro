import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionLevel } from '../GameConditionTypes';

/**
 * Checks if the player is a certain level or higher.
 * Default is inclusive but can be set with inclusive flag
 */
export class ConditionLevelExecutable extends GameConditionExecutable<ClientActionContext>{
	private min: number;
	private max: number | null;

	protected constructor(
		protected override readonly condition: GameConditionLevel,
	){
		super(condition);
		this.min = condition.min ?? 0;
		this.max = condition.max ?? null;
		if (condition.inclusive || condition.inclusive === undefined) {
			this.min -= 1;
			if (this.max) this.max += 1;
		}
	}
	
	public static parse(condition: GameConditionLevel): ConditionLevelExecutable {
		return new this(condition);
	}
	
	protected run({player}: ClientActionContext): boolean{
		if(this.max) {
			return (this.min < player.level.level && player.level.level < this.max );
		} else {
			return (this.min < player.level.level);
		}
		
	}
}
