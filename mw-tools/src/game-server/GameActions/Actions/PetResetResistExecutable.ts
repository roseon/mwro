import { getPetTemplate } from '../../Data/PetTemplates';
import { Resist } from '../../GameState/Resist';
import { PetPackets } from '../../Responses/PetPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionPetResetResist } from '../GameActionTypes';

/**
 * Reset the active pet's resist to template values.
 */
export class PetResetResistExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionPetResetResist) {
		super(action);
	}

	public static parse(action: GameActionPetResetResist): PetResetResistExecutable {
		return new this(action);
	}

	protected run({ client, player }: ClientActionContext): void {
		const pet = player.activePet;
		if (!pet) return;

		let template;
		try {
			template = getPetTemplate(pet.file);
		} catch {
			return;
		}

		pet.fightData.resist = Object.assign(new Resist(), template.resist ?? {});
		client.write(PetPackets.resist(pet));
	}
}
