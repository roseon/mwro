import type { ResistJson } from '../../GameState/Resist';
import { PetPackets } from '../../Responses/PetPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionPetAddResist } from '../GameActionTypes';

/**
 * Add resist values to the active pet.
 */
export class PetAddResistExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionPetAddResist) {
		super(action);
	}

	public static parse(action: GameActionPetAddResist): PetAddResistExecutable {
		return new this(action);
	}

	protected run({ client, player }: ClientActionContext): void {
		const pet = player.activePet;
		if (!pet) return;

		const updates = this.action.resist as Partial<ResistJson>;
		Object.entries(updates).forEach(([key, value]) => {
			if (value === undefined || value === null) return;
			const current = pet.fightData.resist[key as keyof ResistJson] ?? 0;
			pet.fightData.resist[key as keyof ResistJson] = current + Number(value);
		});

		client.write(PetPackets.resist(pet));
	}
}
