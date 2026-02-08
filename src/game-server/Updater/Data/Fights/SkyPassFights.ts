import { monsterTemplates } from '../../../Data/MonsterTemplates';
import { Fight } from '../../../GameState/Fight/Fight';
import { FightCreator } from '../../../GameState/Fight/FightCreator';
import type { FightMemberBase } from '../../../GameState/Fight/FightMember';
import { Monster } from '../../../GameState/Monster/Monster';
import { MonsterCreator } from '../../../GameState/Monster/MonsterCreator';
import type { ActionTemplateCallback } from '../../../GameActions/Actions/ActionTemplateExecutable';
import { FightType } from '../../../Enums/FightType';
import { GameActionParser } from '../../../GameActions/GameActionParser';
import type { GameAction } from '../../../GameActions/GameActionTypes';

export const battleInstructorFight: ActionTemplateCallback = ({ player, game }) => {
	let allies: FightMemberBase[] = FightCreator.getParticipants(player);
	let monsters: FightMemberBase[] = [];

	let monster = new Monster(MonsterCreator.create(monsterTemplates.battleInstructor));
	monsters.push(monster);

	let fight = new Fight(game, allies, monsters, FightType.Monster);
	fight.onFightClose = GameActionParser.parse({
		type: 'array',
		actions: [
			{
				type: 'quest',
				set: { quest: 1001, stage: 2 },
			},
			{
				type: 'npcSay',
				message:
					'Well done! You have bested me, return to the Newbie Guide for your reward.',
			},
		],
	} as GameAction);
	fight.start();
};
