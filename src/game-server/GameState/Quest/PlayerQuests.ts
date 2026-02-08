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

	public constructor(private player: Player) {}

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
	public add(id: number, stage: number | null = null): PlayerQuest {
		if (this.has(id)) throw Error('Cannot add duplicate quest.');

		if (this.quests.size >= 20) throw Error('Cannot have more than 20 quests.');

		let pQuest = new PlayerQuest(this.player, this.getBaseQuest(id), stage ?? 0);
		this.quests.set(id, pQuest);

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
	public addAndSend(id: number, stage: number | null = null): void {
		let pQuest = this.add(id, stage);
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

		this.remove(id);
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
}
