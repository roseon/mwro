import type { PlayerQuest } from '../GameState/Quest/PlayerQuest';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';

export abstract class QuestPackets {
	public static readonly MaxSituationLength: number = 120;
	public static readonly MaxRequirementsLength: number = 250;
	public static readonly MaxRewardLength: number = 250;

	/**
	 * Add a quest to the player's log.
	 * @param playerQuest
	 */
	public static add({ quest, stage }: PlayerQuest): Packet {
		let situationLen = stage.situation.length + 1;
		let requirementLen = stage.requirements.length + 1;
		let rewardLen = stage.reward.length + 1;
		let length = 24 + situationLen + requirementLen + rewardLen;

		let packet = new Packet(length, PacketType.QuestAdd)
			.uint16(6, length - 16)
			.uint32(16, quest.clientId)
			.uint8(20, situationLen)
			.uint8(21, requirementLen)
			.uint8(22, rewardLen);

		if (stage.situation.length !== 0) packet.string(24, stage.situation);

		if (stage.requirements.length !== 0) packet.string(24 + situationLen, stage.requirements);

		if (stage.reward.length !== 0)
			packet.string(24 + situationLen + requirementLen, stage.reward);

		return packet;
	}

	/**
	 * Update the situation text of this quest.
	 * @param playerQuest
	 */
	public static updateSituation({ quest, stage }: PlayerQuest): Packet {
		return new Packet(16 + stage.situation.length + 1, PacketType.QuestUpdateSituation)
			.uint32(12, quest.clientId)
			.string(16, stage.situation);
	}

	/**
	 * Update the requirements text of this quest.
	 * @param playerQuest
	 */
	public static updateRequirements({ quest, stage }: PlayerQuest): Packet {
		return new Packet(16 + stage.requirements.length + 1, PacketType.QuestUpdateRequirements)
			.uint32(12, quest.clientId)
			.string(16, stage.requirements);
	}

	/**
	 * Update the reward text of this quest.
	 * @param playerQuest
	 */
	public static updateReward({ quest, stage }: PlayerQuest): Packet {
		return new Packet(16 + stage.reward.length + 1, PacketType.QuestUpdateReward)
			.uint32(12, quest.clientId)
			.string(16, stage.reward);
	}

	/**
	 * Remove the quest from the player's log.
	 * @param playerQuest
	 */
	public static remove({ quest }: PlayerQuest): Packet {
		return new Packet(16, PacketType.QuestRemove).uint32(12, quest.clientId);
	}

	/**
	 * Clears the situation, requirements and rewards text.
	 * @param playerQuest
	 */
	public static clearText({ quest }: PlayerQuest): Packet {
		return new Packet(16, PacketType.QuestClearText).uint32(12, quest.clientId);
	}
}
