import { monsterTemplates } from '../../../Data/MonsterTemplates';
import { FightType } from '../../../Enums/FightType';
import { Fight } from '../../../GameState/Fight/Fight';
import { FightCreator } from '../../../GameState/Fight/FightCreator';
import type { FightMemberBase } from '../../../GameState/Fight/FightMember';
import { Monster } from '../../../GameState/Monster/Monster';
import { MonsterCreator } from '../../../GameState/Monster/MonsterCreator';
import type { ActionTemplateCallback } from '../ActionTemplateExecutable';
import { GameActionParser } from '../../GameActionParser';
import type { GameAction } from '../../GameActionTypes';

export const battleFelswornFight: ActionTemplateCallback = ({ player, game }) => {
	const allies: FightMemberBase[] = FightCreator.getParticipants(player);
	const monsters: FightMemberBase[] = [];

	const felsworn = new Monster(MonsterCreator.create(monsterTemplates.felswornPet));
	
	// Adjust HP to 34000 if needed (Template might already be close or random)
	// We ensure it is exactly 34000 by adjusting statAdded
	const currentMax = felsworn.fightData.stats.hp.stat;
	if (currentMax < 34000) {
		felsworn.fightData.stats.hp.statAdded += (34000 - currentMax);
	}
    // Set current HP to max
	felsworn.fightData.stats.currentHp = felsworn.fightData.stats.hp.stat;

	monsters.push(felsworn);

	const fight = new Fight(game, allies, monsters, FightType.Monster, GameActionParser.parse({
		type: 'addPet',
		pet: 'felsworn',
	} as GameAction));
	fight.start();
};
