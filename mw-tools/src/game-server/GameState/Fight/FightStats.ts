import type { ItemContainer } from '../Item/ItemContainer';
import { Monster } from '../Monster/Monster';
import { Pet } from '../Pet/Pet';
import { Player } from '../Player/Player';
import { ShapeshiftState } from '../Player/PlayerMemory';
import type { ResistJson } from '../Resist';
import { Resist } from '../Resist';
import type { Stats } from '../Stats/Stats';

export type FightStatJson = {
	hp?: number;
	mp?: number;
	attack?: number;
	speed?: number;
} & ResistJson;

export type FightStat = {
	hp: number;
	mp: number;
	attack: number;
	speed: number;
	resists: Resist;
};
interface StatsSource {
	hp: number;
	mp: number;
	attack: number;
	speed: number;
	defense: number;
	hitRate: number;
	dodgeRate: number;
	dodgeAction: number;
	drainResist: number;
	berserkRate: number;
	berserkDamage: number;
	criticalRate: number;
	criticalDamage: number;
	criticalResist: number;
	comboRate: number;
	comboHit: number;
	counterAttackRate: number;
	counterAttackDamage: number;
	pierce: number;
	pierceDamage: number;
	magicReflect: number;
	magicReflectDamage: number;
	meleeReflect: number;
	meleeReflectDamage: number;
	deathResist: number;
	evilResist: number;
	flashResist: number;
	iceResist: number;
	fireResist: number;
	meleeResist: number;
	poisonResist: number;
	chaosResist: number;
	stunResist: number;
	hypnotizeResist: number;
	frailtyResist: number;
}

export class FightStats {
	private eachStatSource: StatsSource[] = [];
	public totals: FightStat;

	public constructor(member: Player | Pet | Monster) {
		this.getFightData(member.fightData.stats, member.fightData.resist);

		// Player specific buffs
		if (member instanceof Player) {
			this.getEquipment(member.items.equipment);
			this.getSSP(member.memory.shapeshiftState);
		}
		this.totals = this.getTotal();
	}

	public update(member: Player | Pet | Monster): void {
		this.getFightData(member.fightData.stats, member.fightData.resist);

		// Player specific buffs
		if (member instanceof Player) {
			this.getEquipment(member.items.equipment);
			this.getSSP(member.memory.shapeshiftState);
		}
		this.totals = this.getTotal();

		if (member.fightData.stats.currentHp > this.totals.hp) {
			member.fightData.stats.currentHp = this.totals.hp;
		}

		if (member.fightData.stats.currentMp > this.totals.mp) {
			member.fightData.stats.currentMp = this.totals.mp;
		}
	}

	private getTotal(): FightStat {
		let resistJson: ResistJson = {
			defense: this.eachStatSource
				.map(source => source.defense)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			hitRate: this.eachStatSource
				.map(source => source.hitRate)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			dodgeRate: this.eachStatSource
				.map(source => source.dodgeRate)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			dodgeAction: 0,
			drainResist: this.eachStatSource
				.map(source => source.drainResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			berserkRate: this.eachStatSource
				.map(source => source.berserkRate)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			berserkDamage: this.eachStatSource
				.map(source => source.berserkDamage)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			criticalRate: this.eachStatSource
				.map(source => source.criticalRate)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			criticalDamage: this.eachStatSource
				.map(source => source.criticalDamage)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			criticalResist: this.eachStatSource
				.map(source => source.criticalResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			comboRate: this.eachStatSource
				.map(source => source.comboRate)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			comboHit: this.eachStatSource
				.map(source => source.comboHit)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			counterAttackRate: this.eachStatSource
				.map(source => source.counterAttackRate)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			counterAttackDamage: this.eachStatSource
				.map(source => source.counterAttackDamage)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			pierce: this.eachStatSource
				.map(source => source.pierce)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			pierceDamage: this.eachStatSource
				.map(source => source.pierceDamage)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			magicReflect: this.eachStatSource
				.map(source => source.magicReflect)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			magicReflectDamage: this.eachStatSource
				.map(source => source.magicReflectDamage)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			meleeReflect: this.eachStatSource
				.map(source => source.meleeReflect)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			meleeReflectDamage: this.eachStatSource
				.map(source => source.meleeReflectDamage)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			deathResist: this.eachStatSource
				.map(source => source.deathResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			evilResist: this.eachStatSource
				.map(source => source.evilResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			flashResist: this.eachStatSource
				.map(source => source.flashResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			iceResist: this.eachStatSource
				.map(source => source.iceResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			fireResist: this.eachStatSource
				.map(source => source.fireResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			meleeResist: this.eachStatSource
				.map(source => source.meleeResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			poisonResist: this.eachStatSource
				.map(source => source.poisonResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			chaosResist: this.eachStatSource
				.map(source => source.chaosResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			stunResist: this.eachStatSource
				.map(source => source.stunResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			hypnotizeResist: this.eachStatSource
				.map(source => source.hypnotizeResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			frailtyResist: this.eachStatSource
				.map(source => source.frailtyResist)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
		};

		return {
			hp: this.eachStatSource
				.map(source => source.hp)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			mp: this.eachStatSource
				.map(source => source.mp)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			attack: this.eachStatSource
				.map(source => source.attack)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			speed: this.eachStatSource
				.map(source => source.speed)
				.reduce((sum, source) => (sum ?? 0) + (source ?? 0), 0),
			resists: new Resist(resistJson),
		};
	}

	private getFightData(stats: Stats, resist: Resist): void {
		this.eachStatSource = [
			{
				hp: stats.hp.stat ?? 0,
				mp: stats.mp.stat ?? 0,
				attack: stats.attack.stat ?? 0,
				speed: stats.speed.stat ?? 0,
				defense: resist.defense ?? 0,
				hitRate: resist.hitRate ?? 0,
				dodgeRate: resist.dodgeRate ?? 0,
				dodgeAction: 0,
				drainResist: resist.drainResist ?? 0,
				berserkRate: resist.berserkRate ?? 0,
				berserkDamage: resist.berserkDamage ?? 0,
				criticalRate: resist.criticalRate ?? 0,
				criticalDamage: resist.criticalDamage ?? 0,
				criticalResist: resist.criticalResist ?? 0,
				comboRate: resist.comboRate ?? 0,
				comboHit: resist.comboHit ?? 0,
				counterAttackRate: resist.counterAttackRate ?? 0,
				counterAttackDamage: resist.counterAttackDamage ?? 0,
				pierce: resist.pierce ?? 0,
				pierceDamage: resist.pierceDamage ?? 0,
				magicReflect: resist.magicReflect ?? 0,
				magicReflectDamage: resist.magicReflectDamage ?? 0,
				meleeReflect: resist.meleeReflect ?? 0,
				meleeReflectDamage: resist.meleeReflectDamage ?? 0,
				deathResist: resist.deathResist ?? 0,
				evilResist: resist.evilResist ?? 0,
				flashResist: resist.flashResist ?? 0,
				iceResist: resist.iceResist ?? 0,
				fireResist: resist.fireResist ?? 0,
				meleeResist: resist.meleeResist ?? 0,
				poisonResist: resist.poisonResist ?? 0,
				chaosResist: resist.chaosResist ?? 0,
				stunResist: resist.stunResist ?? 0,
				hypnotizeResist: resist.hypnotizeResist ?? 0,
				frailtyResist: resist.frailtyResist ?? 0,
			},
		];
	}

	private getEquipment(equipment: ItemContainer): void {
		for (let item of equipment.values()) {
			if (item.stats) {
				this.eachStatSource.push({
					hp: item.stats.hp ?? 0,
					mp: item.stats.mp ?? 0,
					attack: item.stats.attack ?? 0,
					speed: item.stats.speed ?? 0,
					defense: item.stats.defense ?? 0,
					hitRate: item.stats.hitRate ?? 0,
					dodgeRate: item.stats.dodgeRate ?? 0,
					dodgeAction: 0,
					drainResist: item.stats.drainResist ?? 0,
					berserkRate: item.stats.berserkRate ?? 0,
					berserkDamage: item.stats.berserkDamage ?? 0,
					criticalRate: item.stats.criticalRate ?? 0,
					criticalDamage: item.stats.criticalDamage ?? 0,
					criticalResist: item.stats.criticalResist ?? 0,
					comboRate: item.stats.comboRate ?? 0,
					comboHit: item.stats.comboHit ?? 0,
					counterAttackRate: item.stats.counterAttackRate ?? 0,
					counterAttackDamage: item.stats.counterAttackDamage ?? 0,
					pierce: item.stats.pierce ?? 0,
					pierceDamage: item.stats.pierceDamage ?? 0,
					magicReflect: item.stats.magicReflect ?? 0,
					magicReflectDamage: item.stats.magicReflectDamage ?? 0,
					meleeReflect: item.stats.meleeReflect ?? 0,
					meleeReflectDamage: item.stats.meleeReflectDamage ?? 0,
					deathResist: item.stats.deathResist ?? 0,
					evilResist: item.stats.evilResist ?? 0,
					flashResist: item.stats.flashResist ?? 0,
					iceResist: item.stats.iceResist ?? 0,
					fireResist: item.stats.fireResist ?? 0,
					meleeResist: item.stats.meleeResist ?? 0,
					poisonResist: item.stats.poisonResist ?? 0,
					chaosResist: item.stats.chaosResist ?? 0,
					stunResist: item.stats.stunResist ?? 0,
					hypnotizeResist: item.stats.hypnotizeResist ?? 0,
					frailtyResist: item.stats.frailtyResist ?? 0,
				});
			}

			if (item.itemProperties?.gems) {
				if (item.itemProperties.gems.length > 0) {
					for (let gem of item.itemProperties.gems) {
						if (!gem.stats) {
							continue;
						}

						// Add the gem stats to the fight stats
						this.eachStatSource.push({
							hp: gem.stats.hp ?? 0,
							mp: gem.stats.mp ?? 0,
							attack: gem.stats.attack ?? 0,
							speed: gem.stats.speed ?? 0,
							defense: gem.stats.defense ?? 0,
							hitRate: gem.stats.hitRate ?? 0,
							dodgeRate: gem.stats.dodgeRate ?? 0,
							dodgeAction: 0,
							drainResist: gem.stats.drainResist ?? 0,
							berserkRate: gem.stats.berserkRate ?? 0,
							berserkDamage: gem.stats.berserkDamage ?? 0,
							criticalRate: gem.stats.criticalRate ?? 0,
							criticalDamage: gem.stats.criticalDamage ?? 0,
							criticalResist: gem.stats.criticalResist ?? 0,
							comboRate: gem.stats.comboRate ?? 0,
							comboHit: gem.stats.comboHit ?? 0,
							counterAttackRate: gem.stats.counterAttackRate ?? 0,
							counterAttackDamage: gem.stats.counterAttackDamage ?? 0,
							pierce: gem.stats.pierce ?? 0,
							pierceDamage: gem.stats.pierceDamage ?? 0,
							magicReflect: gem.stats.magicReflect ?? 0,
							magicReflectDamage: gem.stats.magicReflectDamage ?? 0,
							meleeReflect: gem.stats.meleeReflect ?? 0,
							meleeReflectDamage: gem.stats.meleeReflectDamage ?? 0,
							deathResist: gem.stats.deathResist ?? 0,
							evilResist: gem.stats.evilResist ?? 0,
							flashResist: gem.stats.flashResist ?? 0,
							iceResist: gem.stats.iceResist ?? 0,
							fireResist: gem.stats.fireResist ?? 0,
							meleeResist: gem.stats.meleeResist ?? 0,
							poisonResist: gem.stats.poisonResist ?? 0,
							chaosResist: gem.stats.chaosResist ?? 0,
							stunResist: gem.stats.stunResist ?? 0,
							hypnotizeResist: gem.stats.hypnotizeResist ?? 0,
							frailtyResist: gem.stats.frailtyResist ?? 0,
						});
					}
				}
			}
		}
	}

	private getSSP(shapeshiftState: ShapeshiftState): void {
		// Shapeshift stats are percentage based off the current total
		// Resists are flat values
		if (shapeshiftState.stats) {
			let currentTotal = this.getTotal();
			this.eachStatSource.push({
				hp: Math.floor((currentTotal.hp * (shapeshiftState.stats.hp ?? 0)) / 100),
				mp: Math.floor((currentTotal.mp * (shapeshiftState.stats.mp ?? 0)) / 100),
				attack: Math.floor(
					(currentTotal.attack * (shapeshiftState.stats.attack ?? 0)) / 100,
				),
				speed: Math.floor((currentTotal.speed * (shapeshiftState.stats.speed ?? 0)) / 100),
				defense: shapeshiftState.stats.defense ?? 0,
				hitRate: shapeshiftState.stats.hitRate ?? 0,
				dodgeRate: shapeshiftState.stats.dodgeRate ?? 0,
				dodgeAction: 0,
				drainResist: shapeshiftState.stats.drainResist ?? 0,
				berserkRate: shapeshiftState.stats.berserkRate ?? 0,
				berserkDamage: shapeshiftState.stats.berserkDamage ?? 0,
				criticalRate: shapeshiftState.stats.criticalRate ?? 0,
				criticalDamage: shapeshiftState.stats.criticalDamage ?? 0,
				criticalResist: shapeshiftState.stats.criticalResist ?? 0,
				comboRate: shapeshiftState.stats.comboRate ?? 0,
				comboHit: shapeshiftState.stats.comboHit ?? 0,
				counterAttackRate: shapeshiftState.stats.counterAttackRate ?? 0,
				counterAttackDamage: shapeshiftState.stats.counterAttackDamage ?? 0,
				pierce: shapeshiftState.stats.pierce ?? 0,
				pierceDamage: shapeshiftState.stats.pierceDamage ?? 0,
				magicReflect: shapeshiftState.stats.magicReflect ?? 0,
				magicReflectDamage: shapeshiftState.stats.magicReflectDamage ?? 0,
				meleeReflect: shapeshiftState.stats.meleeReflect ?? 0,
				meleeReflectDamage: shapeshiftState.stats.meleeReflectDamage ?? 0,
				deathResist: shapeshiftState.stats.deathResist ?? 0,
				evilResist: shapeshiftState.stats.evilResist ?? 0,
				flashResist: shapeshiftState.stats.flashResist ?? 0,
				iceResist: shapeshiftState.stats.iceResist ?? 0,
				fireResist: shapeshiftState.stats.fireResist ?? 0,
				meleeResist: shapeshiftState.stats.meleeResist ?? 0,
				poisonResist: shapeshiftState.stats.poisonResist ?? 0,
				chaosResist: shapeshiftState.stats.chaosResist ?? 0,
				stunResist: shapeshiftState.stats.stunResist ?? 0,
				hypnotizeResist: shapeshiftState.stats.hypnotizeResist ?? 0,
				frailtyResist: shapeshiftState.stats.frailtyResist ?? 0,
			});
		}
	}
}
