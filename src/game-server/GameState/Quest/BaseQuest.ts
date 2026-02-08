export type BaseQuest = {
	/**
	 * The id used by the server.
	 */
	id: number;

	/**
	 * The id used in the game client.
	 * Use /src/client-quests to find existing ids.
	 */
	clientId: number;

	/**
	 * Different stages in the quest.
	 */
	stages: Map<number, BaseQuestStage>;
};

export type BaseQuestStage = {
	/**
	 * Quest situation.
	 * Limit of 120 characters.
	 */
	situation: string;

	/**
	 * Quest requirements. Set to string '0' to mark as complete.
	 * Limit of 250 characters.
	 */
	requirements: string;

	/**
	 * Quest reward.
	 * Limit of 250 characters.
	 */
	reward: string;
};
