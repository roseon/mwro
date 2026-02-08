import type { PetJsonCollection } from '../../Database/Collections/Player/PlayerJson';
import { Species } from '../../Enums/Species';
import { FightStats } from '../Fight/FightStats';
import type { IndividualJson } from '../Individual/Individual';
import { Individual } from '../Individual/Individual';
import type { IndividualFightDataJson } from '../Individual/IndividualFightData';
import { Level } from '../Level';
import { PetCreator } from './PetCreator';
import type { SkillsGroupJson } from '../Skills/SkillsGroup';
import { PetFightData } from './PetFightData';

type PetJson = IndividualJson & {
	fightData: IndividualFightDataJson;
	baseName?: string;
};

// Pet IDs must be in the 0xC0000000 range.
export class Pet extends Individual {
	public fightData: PetFightData;

	public fightStats: FightStats;

	public mapData: null = null;

	public level: Level = Level.fromLevel(1);

	public icon: number = 0;

	public effect: number = 0;

	public loyalty: number = 0;

	public intimacy: number = 0;

	public species: Species = Species.Empty;

	public baseName: string;

	public skillList: SkillsGroupJson[] = [];

	public constructor(json: PetJson) {
		super(json);
		this.fightData = new PetFightData(json.fightData);
		this.fightStats = new FightStats(this);
		this.baseName = json.baseName ?? json.name;
	}

	public getText(): string {
		return [
			`#c00FFFF${this.baseName}#N`,
			`#E#YLevel:#W${this.level.level}`,
			`#E#YReborn:#W${this.level.reborn}`,
			`#E#YHealth:#W${this.fightStats.totals.hp}`,
			`#E#YMana:#W${this.fightStats.totals.mp}`,
			`#E#YAttack:#W${this.fightStats.totals.attack}`,
			`#E#YSpeed:#W${this.fightStats.totals.speed}`,
			`#E#YGrowthRate:#W${this.fightData.stats.growthRate}`,
		].join('');
	}

	public getResAboveZero(): string {
		const stats = this.fightData.resist;
		type StatDisplay = { label: string; isPercent?: boolean };
		const displayStats: Record<string, StatDisplay> = {
			hitRate: { label: 'Hit Rate', isPercent: true },
			dodgeRate: { label: 'Dodge Rate', isPercent: true },
			criticalRate: { label: 'Critical Rate', isPercent: true },
			criticalDamage: { label: 'Critical Damage', isPercent: true },
			berserkRate: { label: 'Berserk Rate', isPercent: true },
			berserkDamage: { label: 'Berserk Damage', isPercent: true },
			comboRate: { label: 'Combo Rate', isPercent: true },
			comboHit: { label: 'Combo Hit' },
			deathResist: { label: 'Death Resist' },
			evilResist: { label: 'Evil Resist' },
			flashResist: { label: 'Flash Resist' },
			iceResist: { label: 'Ice Resist' },
			fireResist: { label: 'Fire Resist' },
			meleeResist: { label: 'Melee Resist' },
			poisonResist: { label: 'Poison Resist' },
			chaosResist: { label: 'Chaos Resist' },
			stunResist: { label: 'Stun Resist' },
			hypnotizeResist: { label: 'Hypnotize Resist' },
			frailtyResist: { label: 'Frailty Resist' },
		};

		return Object.entries(displayStats)
			.filter(([key]) => stats[key as keyof typeof stats])
			.map(([key, { label, isPercent }]) => {
				const value = stats[key as keyof typeof stats];
				return `#E#G${label}:#W${value}${isPercent ? '%' : ''}`;
			})
			.join('#e');
	}

	public toJson(): PetJsonCollection {
		return {
			id: this.id,
			name: this.name,
			baseName: this.baseName,
			file: this.file,
			stats: this.fightData.stats.toJson(),
			skillList: this.skillList,
			totalExp: this.level.totalExp,
			reborn: this.level.reborn,
			loyalty: this.loyalty,
			intimacy: this.intimacy,
			resist: this.fightData.resist,
		};
	}

	public static fromJson(pet: PetJsonCollection): Pet {
		return PetCreator.fromJson(pet);
	}
}
