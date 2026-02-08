import type { MonsterTemplate } from '../../Data/MonsterTemplates';
import { monsterTemplates } from '../../Data/MonsterTemplates';
import { FightType } from '../../Enums/FightType';
import { Random } from '../../Utils/Random';
import { Monster } from '../Monster/Monster';
import { MonsterCreator } from '../Monster/MonsterCreator';
import type { Player } from '../Player/Player';
import { Fight } from './Fight';
import type { FightMemberBase } from './FightMember';

/**
 * Utilities for creating fights.
 */
export abstract class FightCreator {
	/**
	 * Get list of fight participants based on the leading player.
	 * @param leader
	 */
	public static getParticipants(leader: Player): FightMemberBase[] {
		let allies: FightMemberBase[] = [leader];

		if (leader.activePet) allies.push(leader.activePet);

		if (leader.party) {
			for (let member of leader.party.members) {
				if (member == leader) continue;
				allies.push(member);
				if (member.activePet) allies.push(member.activePet);
			}
		}

		return allies;
	}

	public static createRandom(leader: Player, monsterOptions: string[]): Fight {
		let allies = this.getParticipants(leader);
		let monsterCount = this.getMonsterCount(leader);
		let enemyTemplates: MonsterTemplate[] = [];

		for (let i = 0; i < monsterCount; ++i) {
			let key = monsterOptions[Random.int(0, monsterOptions.length)];
			enemyTemplates.push(monsterTemplates[key]);
		}

		let enemies = enemyTemplates.map((tmpl, i) => {
			let json = MonsterCreator.create(tmpl);
			json.id += i;
			return new Monster(json);
		});

		return new Fight(leader.game, allies, enemies, FightType.Monster);
	}

	private static getMonsterCount(leader: Player): number {
		let partyMembers = 1;
		if (leader.party) partyMembers = leader.party.members.length;

		let count = partyMembers * 2;

		if (partyMembers < 5) count += Random.intInclusive(0, 2);

		return count;
	}
}
