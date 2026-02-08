import { getPetTemplate } from '../../Data/PetTemplates';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionAddPet } from '../GameActionTypes';

/**
 * Give a Pet to the player.
 */
export class AddPetExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionAddPet) {
		super(action);
	}

	public static parse(action: GameActionAddPet): AddPetExecutable {
		return new this(action);
	}

	protected run(context: ClientActionContext): void {
		context.player.addPet(getPetTemplate(this.action.pet));
	}
}
