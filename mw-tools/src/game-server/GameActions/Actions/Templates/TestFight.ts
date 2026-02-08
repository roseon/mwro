import { monsterTemplates } from '../../../Data/MonsterTemplates';
import { FightType } from '../../../Enums/FightType';
import { Fight } from '../../../GameState/Fight/Fight';
import { FightCreator } from '../../../GameState/Fight/FightCreator';
import type { FightMemberBase } from '../../../GameState/Fight/FightMember';
import { Monster } from '../../../GameState/Monster/Monster';
import { MonsterCreator } from '../../../GameState/Monster/MonsterCreator';
import type { ActionTemplateCallback } from '../ActionTemplateExecutable';
import { GameActionParser } from '../../../GameActions/GameActionParser';
import { GameAction } from '../../GameActionTypes';
export const testFight: ActionTemplateCallback = ({ player, game }) => {
	let allies: FightMemberBase[] = FightCreator.getParticipants(player);
	let monsters: FightMemberBase[] = [];

	for (let i = 0; i < 1; ++i) {
		let monster = new Monster(MonsterCreator.create(monsterTemplates.teethor));
		monster.id += i;
		monsters.push(monster);
	}

	let fight = new Fight(game, allies, monsters, FightType.Monster);
	fight.onFightClose = GameActionParser.parse({
		type: 'array',
		actions: [
			{
				type: 'gold',
				amount: 124551,
			},		
			{
				type: 'npcSay',
				message: 'Oh, you\'ve defeated me!',
			},
		]
	} as GameAction);
	fight.start();
};
