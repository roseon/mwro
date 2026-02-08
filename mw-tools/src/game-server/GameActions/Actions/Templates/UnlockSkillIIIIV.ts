import { MessagePackets } from '../../../Responses/MessagePackets';
import { PlayerPackets } from '../../../Responses/PlayerPackets';
import type { ActionTemplateCallback } from '../ActionTemplateExecutable';

export const unlockSkillIIIIV: ActionTemplateCallback = ({ client, player }) => {
	const skillData = player.fightData.skills;
	let added = false;
	const addedIds = new Set<number>();

	for (const skill of skillData.skillData) {
		const baseId = skill.id - (skill.id % 4);
		const skillIII = baseId + 2;
		const skillIV = baseId + 3;
		if (!addedIds.has(skillIII)) {
			skillData.addSkill(skillIII, 0);
			addedIds.add(skillIII);
			added = true;
		}
		if (!addedIds.has(skillIV)) {
			skillData.addSkill(skillIV, 0);
			addedIds.add(skillIV);
			added = true;
		}
	}

	if (added) {
		client.write(
			MessagePackets.showMessage('Skill III and IV unlocked!'),
			PlayerPackets.skills(player),
		);
	} else {
		client.write(MessagePackets.showMessage('No Skill III/IV upgrades available.'));
	}
};
