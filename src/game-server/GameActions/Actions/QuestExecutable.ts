import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionQuest } from '../GameActionTypes';

type QuestAddType = { quest: number; stage: number } | null;

/**
 * Add, update or remove a quest.
 */
export class QuestExecutable extends GameActionExecutable<ClientActionContext> {
	private add: QuestAddType;

	protected constructor(protected override readonly action: GameActionQuest) {
		super(action);
		this.add = QuestExecutable.parseAdd(action.add);
	}

	public static parse(action: GameActionQuest): QuestExecutable {
		return new this(action);
	}

	private static parseAdd(add: GameActionQuest['add']): QuestAddType {
		if (add === null || typeof add === 'undefined') return null;

		if (typeof add === 'number')
			return {
				quest: add,
				stage: 0,
			};

		return {
			quest: add.quest,
			stage: add.stage ?? 0,
		};
	}

	protected run({ player }: ClientActionContext): void {
		let { remove, set } = this.action;

		if (remove) player.quests.removeAndSend(remove);

		if (this.add !== null) player.quests.addAndSend(this.add.quest, this.add.stage);

		if (set) player.quests.get(set.quest)?.setStageAndSend(set.stage);
	}
}
