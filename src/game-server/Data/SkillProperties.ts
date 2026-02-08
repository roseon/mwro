import type { Skill } from '../Enums/Skill';
import { SkillType } from '../Enums/SkillType';

export type SkillProperties = {
	id: Skill;
	type: SkillType;
	rank: 1 | 2 | 3 | 4; // I, II, III or IV skill
	mp: number; // Initial mana cost
	mpAdd: number; // Mana increased for each use
	rounds: number; // How many rounds this lasts (at lvl 1)
	targets: number; // How many targets it hits (at lvl 1)
	single: boolean; // True for I and III skills
	enemy: boolean; // Targets the enemy
};

//Group, rank, mp, mpAdd, rounds, targets, enemy
type SkillPropsCompact = [SkillType, 1 | 2 | 3 | 4, number, number, number, number, boolean];

// prettier-ignore
let propsCompact: SkillPropsCompact[] = [
	[SkillType.Frailty,		1,	35,		0.09,	3,	1,	true],
	[SkillType.Frailty,		2,	80,		0.22,	2,	2,	true],
	[SkillType.Frailty,		3,	450,	0.48,	3,	1,	true],
	[SkillType.Frailty,		4,	1050,	0.91,	2,	3,	true],
	[SkillType.Poison,		1,	35,		0.09,	3,	1,	true],
	[SkillType.Poison,		2,	80,		0.22,	2,	2,	true],
	[SkillType.Poison,		3,	450,	0.48,	3,	1,	true],
	[SkillType.Poison,		4,	1050,	0.91,	2,	3,	true],
	[SkillType.Chaos,		1,	35,		0.09,	3,	1,	true],
	[SkillType.Chaos,		2,	80,		0.22,	2,	2,	true],
	[SkillType.Chaos,		3,	450,	0.48,	3,	1,	true],
	[SkillType.Chaos,		4,	1050,	0.91,	2,	3,	true],
	[SkillType.Hypnotize,	1,	35,		0.09,	3,	1,	true],
	[SkillType.Hypnotize,	2,	80,		0.22,	2,	2,	true],
	[SkillType.Hypnotize,	3,	450,	0.48,	3,	1,	true],
	[SkillType.Hypnotize,	4,	1050,	0.91,	2,	3,	true],
	[SkillType.Stun,		1,	35,		0.09,	3,	1,	true],
	[SkillType.Stun,		2,	80,		0.22,	2,	2,	true],
	[SkillType.Stun,		3,	450,	0.48,	3,	1,	true],
	[SkillType.Stun,		4,	1050,	0.91,	2,	3,	true],
	[SkillType.PurgeChaos,	1,	60,		0.12,	0,	1,	false],
	[SkillType.PurgeChaos,	2,	140,	0.26,	0,	2,	false],
	[SkillType.PurgeChaos,	3,	600,	0.51,	0,	1,	false],
	[SkillType.PurgeChaos,	4,	1400,	0.99,	0,	3,	false],
	[SkillType.UnStun,		1,	60,		0.12,	0,	1,	false],
	[SkillType.UnStun,		2,	140,	0.26,	0,	2,	false],
	[SkillType.UnStun,		3,	600,	0.51,	0,	1,	false],
	[SkillType.UnStun,		4,	1400,	0.99,	0,	3,	false],
	[SkillType.MultiShot,	1,	30,		0.1,	0,	1,	true],
	[SkillType.MultiShot,	2,	70,		0.28,	0,	2,	true],
	[SkillType.MultiShot,	3,	500,	0.58,	0,	1,	true],
	[SkillType.MultiShot,	4,	1200,	1.12,	0,	3,	true],
	[SkillType.Blizzard,	1,	30,		0.1,	0,	1,	true],
	[SkillType.Blizzard,	2,	70,		0.28,	0,	2,	true],
	[SkillType.Blizzard,	3,	500,	0.58,	0,	1,	true],
	[SkillType.Blizzard,	4,	1200,	1.12,	0,	3,	true],
	[SkillType.Speed,		1,	30,		0.09,	3,	1,	false],
	[SkillType.Speed,		2,	70,		0.22,	2,	2,	false],
	[SkillType.Speed,		3,	500,	0.48,	3,	1,	false],
	[SkillType.Speed,		4,	1200,	0.91,	2,	3,	false],
	[SkillType.HealOther,	1,	80,		0.22,	0,	1,	false],
	[SkillType.HealOther,	2,	180,	0.51,	0,	2,	false],
	[SkillType.HealOther,	3,	850,	0.66,	0,	1,	false],
	[SkillType.HealOther,	4,	2000,	1.12,	0,	3,	false],
	[SkillType.Fire,		1,	40,		0.1,	0,	1,	true],
	[SkillType.Fire,		2,	105,	0.28,	0,	2,	true],
	[SkillType.Fire,		3,	600,	0.58,	0,	1,	true],
	[SkillType.Fire,		4,	1400,	1.12,	0,	3,	true],
	[SkillType.Ice,			1,	40,		0.1,	0,	1,	true],
	[SkillType.Ice,			2,	105,	0.28,	0,	2,	true],
	[SkillType.Ice,			3,	600,	0.58,	0,	1,	true],
	[SkillType.Ice,			4,	1400,	1.12,	0,	3,	true],
	[SkillType.Evil,		1,	40,		0.1,	0,	1,	true],
	[SkillType.Evil,		2,	105,	0.28,	0,	2,	true],
	[SkillType.Evil,		3,	600,	0.58,	0,	1,	true],
	[SkillType.Evil,		4,	1400,	1.12,	0,	3,	true],
	[SkillType.Flash,		1,	40,		0.1,	0,	1,	true],
	[SkillType.Flash,		2,	105,	0.28,	0,	2,	true],
	[SkillType.Flash,		3,	600,	0.58,	0,	1,	true],
	[SkillType.Flash,		4,	1400,	1.12,	0,	3,	true],
	[SkillType.Death,		1,	40,		0.1,	9,	1,	true],
	[SkillType.Death,		2,	105,	0.28,	10,	2,	true],
	[SkillType.Death,		3,	600,	0.58,	6,	1,	true],
	[SkillType.Death,		4,	1400,	1.12,	8,	3,	true],
	[SkillType.Enhance,		1,	20,		0.09,	3,	1,	false],
	[SkillType.Enhance,		2,	47,		0.22,	2,	2,	false],
	[SkillType.Enhance,		3,	280,	0.48,	3,	1,	false],
	[SkillType.Enhance,		4,	650,	0.91,	2,	3,	false],
	[SkillType.Protect,		1,	20,		0.09,	3,	1,	false],
	[SkillType.Protect,		2,	47,		0.22,	2,	2,	false],
	[SkillType.Protect,		3,	280,	0.48,	3,	1,	false],
	[SkillType.Protect,		4,	650,	0.91,	2,	3,	false],
	[SkillType.Drain,		1,	20,		0.1,	0,	1,	true],
	[SkillType.Drain,		2,	47,		0.28,	0,	2,	true],
	[SkillType.Drain,		3,	280,	0.58,	0,	1,	true],
	[SkillType.Drain,		4,	650,	1.12,	0,	3,	true],
	[SkillType.Reflect,		1,	20,		0.09,	3,	1,	false],
	[SkillType.Reflect,		2,	47,		0.22,	2,	2,	false],
	[SkillType.Reflect,		3,	280,	0.48,	3,	1,	false],
	[SkillType.Reflect,		4,	650,	0.91,	2,	3,	false],
	[SkillType.Repel,		1,	20,		0.09,	3,	1,	false],
	[SkillType.Repel,		2,	47,		0.22,	2,	2,	false],
	[SkillType.Repel,		3,	280,	0.48,	3,	1,	false],
	[SkillType.Repel,		4,	650,	0.91,	2,	3,	false],
];

export const skillProperties: Record<number, Readonly<SkillProperties>> = {};

propsCompact.forEach(skill => {
	let skillId = skill[0] * 4 + skill[1] - 1;

	skillProperties[skillId] = {
		id: skillId,
		type: skill[0],
		rank: skill[1],
		mp: skill[2],
		mpAdd: skill[3],
		rounds: skill[4],
		targets: skill[5],
		single: skill[1] === 1 || skill[1] === 3,
		enemy: skill[6],
	};
});
