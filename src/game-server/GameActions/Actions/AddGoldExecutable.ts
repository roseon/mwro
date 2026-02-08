import { MessagePackets } from '../../Responses/MessagePackets';
import { Random } from '../../Utils/Random';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionGold } from '../GameActionTypes';

/**
 * Give gold to the player.
 */
export class AddGoldExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionGold) {
		super(action);
	}

	public static parse(action: GameActionGold): AddGoldExecutable {
		return new this(action);
	}

	protected run(context: ClientActionContext): void {
		let amount = Random.fromJson(this.action.amount);
		context.player.items.addGoldAndSend(amount);
		context.client.write(MessagePackets.showSystem(
			amount >= 0 
				? `You received ${amount} gold!` 
				: `You spent ${Math.abs(amount)} gold!`
		));
	}
}
