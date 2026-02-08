import { monsterTemplates } from '../../../Data/MonsterTemplates';
import { FightType } from '../../../Enums/FightType';
import { Fight } from '../../../GameState/Fight/Fight';
import { FightCreator } from '../../../GameState/Fight/FightCreator';
import type { FightMemberBase } from '../../../GameState/Fight/FightMember';
import { Monster } from '../../../GameState/Monster/Monster';
import { MonsterCreator } from '../../../GameState/Monster/MonsterCreator';
import type { ActionTemplateCallback } from '../ActionTemplateExecutable';
import { GameActionParser } from '../../../GameActions/GameActionParser';
import type { GameAction } from '../../GameActionTypes';

export const drowcrusherFight: ActionTemplateCallback = ({ player, game }) => {
	const allies: FightMemberBase[] = FightCreator.getParticipants(player);
	const monsters: FightMemberBase[] = [];

	const drowcrusher = new Monster(MonsterCreator.create(monsterTemplates.drowcrusherBoss));
	monsters.push(drowcrusher);

	for (let i = 0; i < 3; i++) {
		const ghost = new Monster(MonsterCreator.create(monsterTemplates.ghostWarriorElite));
		ghost.id += i + 1;
		monsters.push(ghost);
	}

	for (let i = 0; i < 6; i++) {
		const centaur = new Monster(MonsterCreator.create(monsterTemplates.centaurRaider));
		centaur.id += i + 10;
		monsters.push(centaur);
	}

	const fight = new Fight(game, allies, monsters, FightType.Monster);
	fight.onFightClose = GameActionParser.parse({
		type: 'array',
		actions: [
			{
				type: 'addItem',
				baseItemId: 2000,
				amount: 1,
			},
			{
				type: 'template',
				template: 'unlockSkillIIIIV',
			},
			{
				type: 'quest',
				remove: 60002,
			},
		],
	} as GameAction);
	fight.start();
};
