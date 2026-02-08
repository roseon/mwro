import { Random } from '../../Utils/Random';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionAddItem } from '../GameActionTypes';
import { MessagePackets } from '../../Responses/MessagePackets';
/**
 * Give an item to the player.
 */
export class AddItemExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionAddItem) {
		super(action);
	}

	public static parse(action: GameActionAddItem): AddItemExecutable {
		return new this(action);
	}

	protected run({ game, player }: ClientActionContext): void {
		// Handle dynamic baseItemId that might come from promptText
		let itemId = this.action.baseItemId;
		if (typeof itemId === 'string' && itemId === '${promptText}') {
			itemId = Number(player.memory.promptText);
		}

		let baseItem = game.baseItems.get(Number(itemId));

		if (!baseItem) throw Error('Unknown base item id ' + itemId);

		let amount = Random.fromJson(this.action.amount ?? 1);

		if (!player.items.inventory.hasSpaceFor(baseItem, amount))
			throw Error('Player does not have space, add condition check.');

		player.items.addItemAndSend(baseItem, amount);
		player.client?.write(MessagePackets.showSystem(`You received ${amount} ${baseItem.name}!`));
	}
}
