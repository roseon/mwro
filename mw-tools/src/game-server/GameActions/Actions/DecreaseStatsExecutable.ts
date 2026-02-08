import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionDecreaseStats } from '../GameActionTypes';
import { PetPackets } from '../../Responses/PetPackets';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import type { Stats } from '../../GameState/Stats/Stats';

const MIN_BASE_POINTS = 1;

/**
 * Decrease stat points and refund them to unused points.
 */
export class DecreaseStatsExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionDecreaseStats) {
		super(action);
	}

	public static parse(action: GameActionDecreaseStats): DecreaseStatsExecutable {
		return new this(action);
	}

	protected run({ client, player }: ClientActionContext): void {
		if (this.action.pet) {
			const pet = player.activePet;
			if (!pet) return;
			const stats = pet.fightData.stats;
			const refunded = this.applyDecrease(stats, {
				sta: this.action.sta ?? 0,
				int: this.action.int ?? 0,
				str: this.action.str ?? 0,
				agi: this.action.agi ?? 0,
			});
			if (refunded <= 0) return;
			stats.unused += refunded;
			pet.fightStats.update(pet);
			stats.currentHp = Math.min(stats.currentHp, pet.fightStats.totals.hp);
			stats.currentMp = Math.min(stats.currentMp, pet.fightStats.totals.mp);
			client.write(PetPackets.useStats(pet));
			client.write(PetPackets.level(pet));
			client.write(PetPackets.healHp(pet));
			client.write(PetPackets.healMp(pet));
			return;
		}

		const stats = player.fightData.stats;
		const refunded = this.applyDecrease(stats, {
			sta: this.action.sta ?? 0,
			int: this.action.int ?? 0,
			str: this.action.str ?? 0,
			agi: this.action.agi ?? 0,
		});
		if (refunded <= 0) return;
		stats.unused += refunded;
		player.fightStats.update(player);
		stats.currentHp = Math.min(stats.currentHp, player.fightStats.totals.hp);
		stats.currentMp = Math.min(stats.currentMp, player.fightStats.totals.mp);
		client.write(PlayerPackets.useStats(player));
		client.write(PlayerPackets.information(player));
	}

	private applyDecrease(
		stats: Stats,
		amounts: { sta: number; int: number; str: number; agi: number },
	): number {
		let refunded = 0;

		refunded += this.decreaseStat(stats.hp, amounts.sta);
		refunded += this.decreaseStat(stats.mp, amounts.int);
		refunded += this.decreaseStat(stats.attack, amounts.str);
		refunded += this.decreaseStat(stats.speed, amounts.agi);

		return refunded;
	}

	private decreaseStat(statGroup: { pointsBase: number }, amount: number): number {
		if (amount <= 0) return 0;
		const minBase = MIN_BASE_POINTS;
		const available = Math.max(0, statGroup.pointsBase - minBase);
		const applied = Math.min(available, amount);
		statGroup.pointsBase -= applied;
		return applied;
	}
}
