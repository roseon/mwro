import { MessagePackets } from '../../../Responses/MessagePackets';
import { PlayerPackets } from '../../../Responses/PlayerPackets';
import type { ActionTemplateCallback } from '../ActionTemplateExecutable';

export const unlockSkillII: ActionTemplateCallback = ({ client, player }) => {
	const itemId = 20007;
	const questId = 2000;

	if (player.items.getItemCount(itemId) <= 0) {
		client.write(MessagePackets.showMessage('You need the Skill II Token.'));
		return;
	}

	const skillData = player.fightData.skills;
	let added = false;

	for (const skill of skillData.skillData) {
		if (skill.id % 4 === 0) {
			const skillId = skill.id + 1;
			skillData.addSkill(skillId, 0);
			added = true;
		}
	}

	if (added) {
		player.items.removeItemAndSend(itemId, 1);
		if (player.quests.has(questId)) {
			player.quests.removeAndSend(questId);
		}
		client.write(
			MessagePackets.showMessage('Skill II unlocked!'),
			PlayerPackets.skills(player),
		);
	} else {
		client.write(MessagePackets.showMessage('No Skill II upgrades available.'));
	}
};
