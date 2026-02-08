import { CharacterGender, CharacterRace } from '../Enums/CharacterClass';

export type ResistJson = {
	defense?: number;
	hitRate?: number;
	dodgeRate?: number;
	dodgeAction?: number;
	drainResist?: number;
	berserkRate?: number;
	berserkDamage?: number;
	criticalRate?: number;
	criticalDamage?: number;
	criticalResist?: number;
	comboRate?: number;
	comboHit?: number;
	counterAttackRate?: number;
	counterAttackDamage?: number;
	pierce?: number;
	pierceDamage?: number;
	magicReflect?: number;
	magicReflectDamage?: number;
	meleeReflect?: number;
	meleeReflectDamage?: number;
	deathResist?: number;
	evilResist?: number;
	flashResist?: number;
	iceResist?: number;
	fireResist?: number;
	meleeResist?: number;
	poisonResist?: number;
	chaosResist?: number;
	stunResist?: number;
	hypnotizeResist?: number;
	frailtyResist?: number;
};

export class Resist {
	public defense: number;
	public hitRate: number;
	public dodgeRate: number;
	public dodgeAction: number;
	public drainResist: number;
	public berserkRate: number;
	public berserkDamage: number;
	public criticalRate: number;
	public criticalDamage: number;
	public criticalResist: number;
	public comboRate: number;
	public comboHit: number;
	public counterAttackRate: number;
	public counterAttackDamage: number;
	public pierce: number;
	public pierceDamage: number;
	public magicReflect: number;
	public magicReflectDamage: number;
	public meleeReflect: number;
	public meleeReflectDamage: number;
	public deathResist: number;
	public evilResist: number;
	public flashResist: number;
	public iceResist: number;
	public fireResist: number;
	public meleeResist: number;
	public poisonResist: number;
	public chaosResist: number;
	public stunResist: number;
	public hypnotizeResist: number;
	public frailtyResist: number;

	public constructor(json?: ResistJson) {
		this.defense = json?.defense ?? 0;
		this.hitRate = json?.hitRate ?? 100;
		this.dodgeRate = json?.dodgeRate ?? 0;
		this.dodgeAction = 0;
		this.drainResist = json?.drainResist ?? 0;
		this.berserkRate = json?.berserkRate ?? 0;
		this.berserkDamage = json?.berserkDamage ?? 0;
		this.criticalRate = json?.criticalRate ?? 0;
		this.criticalDamage = json?.criticalDamage ?? 0;
		this.criticalResist = json?.criticalResist ?? 0;
		this.comboRate = json?.comboRate ?? 0;
		this.comboHit = json?.comboHit ?? 0;
		this.counterAttackRate = json?.counterAttackRate ?? 0;
		this.counterAttackDamage = json?.counterAttackDamage ?? 0;
		this.pierce = json?.pierce ?? 0;
		this.pierceDamage = json?.pierceDamage ?? 0;
		this.magicReflect = json?.magicReflect ?? 0;
		this.magicReflectDamage = json?.magicReflectDamage ?? 0;
		this.meleeReflect = json?.meleeReflect ?? 0;
		this.meleeReflectDamage = json?.meleeReflectDamage ?? 0;
		this.deathResist = json?.deathResist ?? 0;
		this.evilResist = json?.evilResist ?? 0;
		this.flashResist = json?.flashResist ?? 0;
		this.iceResist = json?.iceResist ?? 0;
		this.fireResist = json?.fireResist ?? 0;
		this.meleeResist = json?.meleeResist ?? 0;
		this.poisonResist = json?.poisonResist ?? 0;
		this.chaosResist = json?.chaosResist ?? 0;
		this.stunResist = json?.stunResist ?? 0;
		this.hypnotizeResist = json?.hypnotizeResist ?? 0;
		this.frailtyResist = json?.frailtyResist ?? 0;
	}

	public static createForRaceGender(race: CharacterRace, gender: CharacterGender): Resist {
		let resist: Resist = new Resist();

		switch (race) {
			case CharacterRace.Human:
				resist.chaosResist = 5;
				resist.hypnotizeResist = 5;
				resist.stunResist = 5;

				if (gender === CharacterGender.Male) {
					resist.frailtyResist = 5;
				} else {
					resist.poisonResist = 5;
				}
				break;

			case CharacterRace.Centaur:
				if (gender === CharacterGender.Male) {
					resist.chaosResist = 5;
				} else {
					resist.stunResist = 5;
				}
				break;

			case CharacterRace.Mage:
				resist.flashResist = 5;
				resist.evilResist = 5;
				resist.deathResist = 5;

				if (gender === CharacterGender.Male) {
					resist.fireResist = 5;
				} else {
					resist.iceResist = 5;
				}
				break;

			case CharacterRace.Borg:
				resist.drainResist = 5;
				resist.meleeResist = 5;
				resist.berserkDamage = 10;
				resist.berserkRate = 5;
				resist.criticalDamage = 10;
				resist.criticalRate = 5;
				resist.pierceDamage = 10;
				resist.pierce = 5;

				if (gender === CharacterGender.Male) {
					resist.drainResist += 5;
				} else {
					resist.meleeResist += 5;
				}
		}

		return resist;
	}

	public updateResistForLevel(level: number, race: CharacterRace, gender: CharacterGender): void {
		let resist: Resist = Resist.createForRaceGender(race, gender);
		let levelBonus = Math.floor(level / 10) * 2; // Every 10 levels, increase resist by 2

		if (levelBonus > 0) {
			// Uppdate resist values if they are > 0
			if (resist.berserkDamage > 0) {
				this.berserkDamage = resist.berserkDamage + levelBonus;
			}
			if (resist.berserkRate > 0) {
				this.berserkRate = resist.berserkRate + levelBonus;
			}
			if (resist.chaosResist > 0) {
				this.chaosResist = resist.chaosResist + levelBonus;
			}
			if (resist.criticalDamage > 0) {
				this.criticalDamage = resist.criticalDamage + levelBonus;
			}
			if (resist.criticalRate > 0) {
				this.criticalRate = resist.criticalRate + levelBonus;
			}
			if (resist.deathResist > 0) {
				this.deathResist = resist.deathResist + levelBonus;
			}
			if (resist.evilResist > 0) {
				this.evilResist = resist.evilResist + levelBonus;
			}
			if (resist.flashResist > 0) {
				this.flashResist = resist.flashResist + levelBonus;
			}
			if (resist.fireResist > 0) {
				this.fireResist = resist.fireResist + levelBonus;
			}
			if (resist.frailtyResist > 0) {
				this.frailtyResist = resist.frailtyResist + levelBonus;
			}
			if (resist.hypnotizeResist > 0) {
				this.hypnotizeResist = resist.hypnotizeResist + levelBonus;
			}
			if (resist.iceResist > 0) {
				this.iceResist = resist.iceResist + levelBonus;
			}
			if (resist.pierce > 0) {
				this.pierce = resist.pierce + levelBonus;
			}
			if (resist.pierceDamage > 0) {
				this.pierceDamage = resist.pierceDamage + levelBonus;
			}
			if (resist.poisonResist > 0) {
				this.poisonResist = resist.poisonResist + levelBonus;
			}
			if (resist.stunResist > 0) {
				this.stunResist = resist.stunResist + levelBonus;
			}

			// Only female borgs get bonus to meleeResist
			if (resist.meleeResist > 0 && gender === CharacterGender.Female) {
				this.meleeResist = resist.meleeResist + levelBonus;
			}
			// only male borgs get bonus to drainResist
			if (resist.drainResist > 0 && gender === CharacterGender.Male) {
				this.drainResist = resist.drainResist + levelBonus;
			}
		}
	}
}
