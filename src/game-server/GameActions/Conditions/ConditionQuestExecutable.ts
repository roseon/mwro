import type { ClientActionContext } from '../GameActionContext';
import { GameConditionExecutable } from '../GameConditionExecutable';
import type { GameConditionQuest } from '../GameConditionTypes';

/**
 * Checks if the player has a quest.
 */
export class ConditionQuestExecutable extends GameConditionExecutable<ClientActionContext> {
	protected constructor(protected override readonly condition: GameConditionQuest) {
		super(condition);
	}

	public static parse(condition: GameConditionQuest): ConditionQuestExecutable {
		return new this(condition);
	}

	protected run({ player }: ClientActionContext): boolean {
		if ('stage' in this.condition) {
			let quest = player.quests.get(this.condition.quest);
			return quest?.stageIndex === this.condition.stage;
		} else {
			return player.quests.has(this.condition.quest);
		}
	}
}
