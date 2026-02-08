import { Item } from '../../GameState/Item/Item';
import { ShopPackets } from '../../Responses/ShopPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionShop } from '../GameActionTypes';

/**
 * Opens an NPC shop with specified items.
 */
export class ShopExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionShop) {
		super(action);
	}

	public static parse(action: GameActionShop): ShopExecutable {
		return new this(action);
	}

	protected run({ client, game, player }: ClientActionContext): void {
		// Create items from shop data
		const items = this.action.items.map(itemData => {
			const item = new Item(game.baseItems.get(itemData.itemId)!);
			item.price = itemData.price;
			return item;
		});

		player.memory.npcItems = items;
		client.write(...ShopPackets.npcVendor(items));
	}
}
