import { Random } from '../../Utils/Random';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionGiveItem } from '../GameActionTypes';
import { Logger } from '../../Logger/Logger';

/**
 * Give an item from one player to another.
 */
export class GiveItemExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionGiveItem) {
		super(action);
	}

	public static parse(action: GameActionGiveItem): GiveItemExecutable {
		return new this(action);
	}

	protected run({ game, player }: ClientActionContext): void {
		let baseItem = game.baseItems.get(Number(this.action.baseItemId));
		let isNpc = false;	
		if (!baseItem) throw Error('Unknown base item id ' + this.action.baseItemId);
        let target = Number(this.action.recipientId);
		let index = [0, 1, 2];
		let amount = Random.fromJson(this.action.amount ?? 1);
		if (!isNpc) {
			player.items.giveItemToPlayerAndSend(target, index, [amount]);
		} else {
			player.items.giveItemToNpcAndSend(target, index, [amount]);
		}

	}
}
