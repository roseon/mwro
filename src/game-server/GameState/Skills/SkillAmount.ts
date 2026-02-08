import { Skill } from '../../Enums/Skill';

/**
 * Called to get amount of a skill by id, Amount will be damage for attacking skills and percentage for drain/poison/frailty skills.
 * @param key
 * @returns
 */
export function getSkillAmount(key: number): number[] {
	let effect: number[] | undefined = SkillAmount.get(key);
	if (!effect) throw Error(`Skill ${key} does not exist in SkillAmount`);
	return effect;
}

const SkillAmount = new Map([
	[Skill.FireI, [142, 284, 400, 867, 1206, 1572, 2656, 3276, 3964, 5895, 6925]],
	[Skill.FireII, [112, 220, 340, 696, 986, 1257, 2124, 2520, 3172, 4715, 5540]],
	[Skill.FireIII, [1282, 1368, 1532, 2610, 2994, 3444, 5288, 6080, 6960, 9924, 11250]],
	[Skill.FireIV, [880, 918, 1026, 1749, 2004, 2307, 3544, 4072, 4664, 6645, 7540]],
	[Skill.FlashI, [142, 284, 400, 867, 1206, 1572, 2656, 3276, 3964, 5895, 6925]],
	[Skill.FlashII, [112, 220, 340, 696, 986, 1257, 2124, 2520, 3172, 4715, 5540]],
	[Skill.FlashIII, [1282, 1368, 1532, 2610, 2994, 3444, 5288, 6080, 6960, 9924, 11250]],
	[Skill.FlashIV, [880, 918, 1026, 1749, 2004, 2307, 3544, 4072, 4664, 6645, 7540]],
	[Skill.IceI, [142, 284, 400, 867, 1206, 1572, 2656, 3276, 3964, 5895, 6925]],
	[Skill.IceII, [112, 220, 340, 696, 986, 1257, 2124, 2520, 3172, 4715, 5540]],
	[Skill.IceIII, [1282, 1368, 1532, 2610, 2994, 3444, 5288, 6080, 6960, 9924, 11250]],
	[Skill.IceIV, [880, 918, 1026, 1749, 2004, 2307, 3544, 4072, 4664, 6645, 7540]],
	[Skill.EvilI, [142, 284, 400, 867, 1206, 1572, 2656, 3276, 3964, 5895, 6925]],
	[Skill.EvilII, [112, 220, 340, 696, 986, 1257, 2124, 2520, 3172, 4715, 5540]],
	[Skill.EvilIII, [1282, 1368, 1532, 2610, 2994, 3444, 5288, 6080, 6960, 9924, 11250]],
	[Skill.EvilIV, [880, 918, 1026, 1749, 2004, 2307, 3544, 4072, 4664, 6645, 7540]],
	[Skill.DeathI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.DeathII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.DeathIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.DeathIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.FrailtyI, [2.5, 3.1, 3.7, 4.4, 5.6, 6.8, 8.1, 9.3, 11.2, 11.8, 12.5]], //TODO
	[Skill.FrailtyII, [2, 2.5, 3, 3.5, 4.5, 5.5, 6.5, 7.5, 9, 9.5, 10]], //TODO
	[Skill.FrailtyIII, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]], //TODO
	[Skill.FrailtyIV, [6.6, 7.3, 8, 8.6, 9.3, 10, 10.7, 11.5, 12, 12.8, 13.5]], //TODO
	[Skill.PoisonI, [6.2, 7.5, 9, 11, 13.5, 15.5, 17, 18, 22, 24, 26]], //TODO
	[Skill.PoisonII, [5, 6, 7, 9, 11, 12, 13, 14, 18, 20, 21]], //TODO
	[Skill.PoisonIII, [15, 18, 21, 24, 27, 30, 32, 34, 36, 38, 40]], //TODO
	[Skill.PoisonIV, [10, 12, 14, 16, 18, 20, 21.4, 22.5, 24, 25, 28]], //TODO
	[Skill.ChaosI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ChaosII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ChaosIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ChaosIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.HypnotizeI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.HypnotizeII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.HypnotizeIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.HypnotizeIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.StunI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.StunII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.StunII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.StunIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.PurgeChaosI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.PurgeChaosII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.PurgeChaosIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.PurgeChaosIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.MultiShotI, [132, 264, 400, 867, 1206, 1572, 2656, 3276, 3964, 5895, 6925]],
	[Skill.MultiShotII, [104, 210, 320, 696, 963, 1257, 2124, 2620, 3172, 4715, 5540]],
	[Skill.MultiShotIII, [1252, 1368, 1532, 2610, 2994, 3444, 5288, 6080, 6960, 9920, 11250]],
	[Skill.MultiShotIV, [840, 918, 1026, 1749, 2004, 2307, 3544, 4072, 4664, 6645, 7540]],
	[Skill.UnStunI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.UnStunII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.UnStunIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.UnStunIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.BlizzardI, [132, 264, 400, 867, 1206, 1572, 2656, 3276, 3964, 5895, 6925]],
	[Skill.BlizzardII, [104, 210, 320, 696, 963, 1257, 2124, 2620, 3172, 4715, 5540]],
	[Skill.BlizzardIII, [1252, 1368, 1532, 2610, 2994, 3444, 5288, 6080, 6960, 9920, 11250]],
	[Skill.BlizzardIV, [840, 918, 1026, 1749, 2004, 2307, 3544, 4072, 4664, 6645, 7540]],
	[Skill.SpeedI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.SpeedII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.SpeedIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.SpeedIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.HealOtherI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], //TODO
	[Skill.HealOtherII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], //TODO
	[Skill.HealOtherIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], //TODO
	[Skill.HealOtherIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], //TODO
	[Skill.EnhanceI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.EnhanceII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.EnhanceIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.EnhanceIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ProtectI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ProtectII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ProtectIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ProtectIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.DrainI, [2.5, 3.8, 5, 6.2, 7.5, 9, 11.5, 13, 15, 17, 18.5]], //TODO
	[Skill.DrainII, [2, 3, 4, 5, 6, 7, 9, 10, 12, 14, 15]], //TODO
	[Skill.DrainIII, [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]], //TODO
	[Skill.DrainIV, [6.5, 8, 9, 11, 12, 13, 14, 15, 16, 18, 20.5]], //TODO
	[Skill.ReflectI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ReflectII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ReflectIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.ReflectIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.RepelI, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.RepelII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.RepelIII, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	[Skill.RepelIV, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
]);
