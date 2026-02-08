import { readFileSync } from 'fs';
import { join } from 'path';
import type { BaseQuestJson } from '../../Database/Collections/Quest/BaseQuestCollection';

const questsPath = join(process.cwd(), 'output', 'quests_all.json');
let clientQuests: any[] = [];

try {
    clientQuests = JSON.parse(readFileSync(questsPath, 'utf-8'));
} catch (e) {
    console.warn('Could not load quests_all.json from output directory. Make sure to run "npm run extract-quests" first.');
}

export const questDataList: BaseQuestJson[] = [
	...clientQuests.map((q: any) => {
		const stages: BaseQuestJson['stages'] = {
			0: {
				situation: q.description.substring(0, 120),
				requirements: '0', // Default to complete or unknown
				reward: 'None'
			}
		};

		if (q.idStart === 1001) {
			stages[1] = {
				situation: q.description.substring(0, 120),
				requirements: '0',
				reward: 'None'
			};
			stages[2] = {
				situation: q.description.substring(0, 120),
				requirements: '0',
				reward: 'None'
			};
		}
		if (q.idStart === 1002) {
			stages[1] = {
				situation: q.description.substring(0, 120),
				requirements: '0',
				reward: 'None'
			};
			stages[2] = {
				situation: q.description.substring(0, 120),
				requirements: '0',
				reward: 'None'
			};
		}

		return {
			id: q.idStart, // Use idStart as the server ID
			clientId: q.idStart,
			name: q.name,
			description: q.description,
			stages
		};
	}),
	{
		id: 1005,
		clientId: 1005,
		name: 'Lost Items',
		description: 'The Stonesmith needs your help. Go to Revive Arena and collect 8 lost items from the monsters there.',
		stages: {
			0: {
				situation: 'Collect 8 lost items from monsters in Revive Arena.',
				requirements: '8 Lost Items',
				reward: 'Exp/Gold'
			}
		}
	}
	,
	{
		id: 2000,
		clientId: 2000,
		name: 'Skill II Initiation',
		description:
			'You reached level 20. Visit the Skill Trainer in Woodlingor Skill Center and learn where to obtain the Skill II Token.',
		stages: {
			0: {
				situation:
					'Find the Skill Trainer in Woodlingor Skill Center (50,39) to learn where to collect the Skill II Token.',
				requirements: 'Speak to Skill Trainer',
				reward: 'Unlock Skill II'
			}
		}
	},
	{
		id: 60002,
		clientId: 60002,
		name: 'Challenge Drowcrusher',
		description:
			'Drowcrusher is one of the protector for the Rift of Darkness. It entered into Myth World by accident with Drow Lord. It has a special sense for certain magical weapons. If it find any warrior in possession of these weapons, it will challenge the warrior.',
		stages: {
			0: {
				situation:
					'Talk to the Skill Trainer, then go to Demon Square and challenge Drowcrusher with your class boots +5.',
				requirements: 'Defeat Drowcrusher',
				reward: 'Unlock Skill III & IV'
			}
		}
	}
];
