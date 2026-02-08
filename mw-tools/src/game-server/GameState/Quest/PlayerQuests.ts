import type { PlayerQuestJson } from '../../Database/Collections/Player/PlayerJson';
import { MessagePackets } from '../../Responses/MessagePackets';
import { QuestPackets } from '../../Responses/QuestPackets';
import type { Player } from '../Player/Player';
import type { BaseQuest } from './BaseQuest';
import { PlayerQuest } from './PlayerQuest';

/**
 * Manages a list of the player's quests.
 */
export class PlayerQuests {
	private quests: Map<number, PlayerQuest> = new Map();
	private questChains: Map<number, { quest: number; stage: number }[]> = new Map();

	public constructor(private player: Player, quests: PlayerQuestJson[] = []) {
		for (const quest of quests) {
			this.add(quest.id, quest.stage);
		}
	}

	/**
	 * Get all quests.
	 */
	public getAll(): PlayerQuest[] {
		return [...this.quests.values()];
	}

	/**
	 * Add a quest to the questlog.
	 * @param id
	 * @param stage
	 */
	public add(
		id: number,
		stage: number | null = null,
		chain: { quest: number; stage: number }[] = [],
	): PlayerQuest {
		if (this.has(id)) throw Error('Cannot add duplicate quest.');

		if (this.quests.size >= 20) throw Error('Cannot have more than 20 quests.');

		const quest = this.getBaseQuest(id);
		let stageIndex = stage ?? 0;
		if (!quest.stages.has(stageIndex)) {
			const fallbackStage = this.getFallbackStage(quest);
			if (fallbackStage === null)
				throw Error(`Quest ${id} has no valid stages to start.`);
			stageIndex = fallbackStage;
		}

		let pQuest = new PlayerQuest(this.player, quest, stageIndex);
		this.quests.set(id, pQuest);
		if (chain.length > 0) this.questChains.set(id, this.normalizeChain(chain));

		return pQuest;
	}

	/**
	 * Get a quest by id.
	 * @param id
	 */
	public get(id: number): PlayerQuest | null {
		return this.quests.get(id) ?? null;
	}

	/**
	 * See if the player has a quest with this id.
	 * @param id
	 */
	public has(id: number): boolean {
		return this.quests.has(id);
	}

	/**
	 * Remove the quest from the questlog.
	 * @param id
	 */
	public remove(id: number): void {
		if (!this.has(id)) throw Error("Attempting to remove quest the player doesn't have.");

		this.quests.delete(id);
	}

	/**
	 * Add a quest to the questlog and update the client.
	 * @param id
	 * @param stage
	 */
	public addAndSend(
		id: number,
		stage: number | null = null,
		chain: { quest: number; stage: number }[] = [],
	): void {
		if (this.has(id)) return;
		let pQuest = this.add(id, stage, chain);
		this.player.client?.write(
			QuestPackets.add(pQuest),
			MessagePackets.showMessage('A new quest was added!'),
		);
	}

	/**
	 * Remove a quest from the questlog and update the client.
	 * @param id
	 */
	public removeAndSend(id: number): void {
		let pQuest = this.get(id);

		if (pQuest !== null) this.player.client?.write(QuestPackets.remove(pQuest));
		const chain = this.questChains.get(id) ?? null;
		if (chain) this.questChains.delete(id);

		this.remove(id);
		this.addNextFromChain(chain);
	}

	/**
	 * Retrieve the base quest with the given id. Throws if not found.
	 * @param id
	 */
	private getBaseQuest(id: number): BaseQuest {
		let quest = this.player.game.baseQuests.get(id);

		if (!quest) throw Error('Unknown base quest id ' + id);

		return quest;
	}

	private getFallbackStage(quest: BaseQuest): number | null {
		const stages = [...quest.stages.keys()];
		if (stages.length === 0) return null;
		return Math.min(...stages);
	}

	private normalizeChain(chain: { quest: number; stage: number }[]): { quest: number; stage: number }[] {
		return chain.map(entry => {
			const quest = this.getBaseQuest(entry.quest);
			const stageIndex = quest.stages.has(entry.stage)
				? entry.stage
				: this.getFallbackStage(quest);
			if (stageIndex === null)
				throw Error(`Quest ${entry.quest} has no valid stages to start.`);
			return {
				quest: entry.quest,
				stage: stageIndex,
			};
		});
	}

	private addNextFromChain(chain: { quest: number; stage: number }[] | null): void {
		if (!chain || chain.length === 0) return;
		const [next, ...remaining] = chain;
		this.addAndSend(next.quest, next.stage, remaining);
	}

	public toJson(): PlayerQuestJson[] {
		let json: PlayerQuestJson[] = [];

		for (let quest of this.quests.values()) {
			json.push({
				id: quest.quest.id,
				stage: quest.stageIndex,
			});
		}

		return json;
	}
}
