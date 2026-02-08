import { PetPackets } from '../../Responses/PetPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionPetResetLoyalty } from '../GameActionTypes';

/**
 * Reset the active pet's loyalty to 100.
 */
export class PetResetLoyaltyExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionPetResetLoyalty) {
		super(action);
	}

	public static parse(action: GameActionPetResetLoyalty): PetResetLoyaltyExecutable {
		return new this(action);
	}

	protected run({ client, player }: ClientActionContext): void {
		const pet = player.activePet;
		if (!pet) return;

		pet.loyalty = 100;
		client.write(PetPackets.list(player.pets));
	}
}
