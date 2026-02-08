import type { Stats } from '../../GameState/Stats/Stats';
import { PetPackets } from '../../Responses/PetPackets';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionHeal } from '../GameActionTypes';

/**
 * Heals the player or pet.
 */
export class HealExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionHeal) {
		super(action);
	}

	public static parse(action: GameActionHeal): HealExecutable {
		return new this(action);
	}

	protected run(context: ClientActionContext): void {
		if (this.action.pet) this.runPet(context);
		else this.runPlayer(context);
	}

	private runPlayer({ client, player }: ClientActionContext): void {
		let stats = player.fightData.stats;
		this.doHeal(stats);

		if (this.action.hp) client.write(PlayerPackets.healHp(stats.currentHp));
		if (this.action.mp) client.write(PlayerPackets.healMp(stats.currentMp));
	}

	private runPet({ client, player }: ClientActionContext): void {
		let pet = player.activePet;

		if (!pet) return;

		this.doHeal(pet.fightData.stats);

		if (this.action.hp) client.write(PetPackets.healHp(pet));
		if (this.action.mp) client.write(PetPackets.healMp(pet));
	}

	private doHeal(stats: Stats): void {
		if (this.action.isPerc) {
			if (this.action.hp) stats.addHpPerc(this.action.hp);
			if (this.action.mp) stats.addMpPerc(this.action.mp);
		} else {
			if (this.action.hp) stats.addHp(this.action.hp);
			if (this.action.mp) stats.addMp(this.action.mp);
		}
	}
}
