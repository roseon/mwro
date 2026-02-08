import { QuestPackets } from '../../Responses/QuestPackets';
import type { Player } from '../Player/Player';
import type { BaseQuest, BaseQuestStage } from './BaseQuest';

export class PlayerQuest {
	/**
	 * The stage the player is currently at.
	 */
	public get stage(): BaseQuestStage {
		return this._stage;
	}

	/**
	 * The index of the current stage.
	 */
	public get stageIndex(): number {
		return this._stageIndex;
	}

	private _stageIndex: number;
	private _stage: BaseQuestStage;

	public constructor(private player: Player, public quest: BaseQuest, stageIndex: number) {
		let stage = quest.stages.get(stageIndex) ?? null;

		if (stage === null) throw Error(`Invalid stage (${quest.id},${stageIndex})`);

		this._stageIndex = stageIndex;
		this._stage = stage;
	}

	/**
	 * Changes the stage to the given one.
	 * @param stageIndex
	 */
	public setStage(stageIndex: number): void {
		let stage = this.quest.stages.get(stageIndex) ?? null;

		if (stage === null) throw Error(`Invalid stage (${this.quest.id},${stageIndex})`);

		this._stageIndex = stageIndex;
		this._stage = stage;
	}

	/**
	 * Changes the stage to the given one and sends any new text to the client.
	 * @param stageIndex
	 */
	public setStageAndSend(stageIndex: number): void {
		let prev = this._stage;
		this.setStage(stageIndex);
		let curr = this._stage;

		if (prev.requirements !== curr.requirements)
			this.player.client?.write(QuestPackets.updateRequirements(this));

		if (prev.reward !== curr.reward) this.player.client?.write(QuestPackets.updateReward(this));

		if (prev.situation !== curr.situation)
			this.player.client?.write(QuestPackets.updateSituation(this));
	}
}
