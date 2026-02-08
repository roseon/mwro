import { Item } from '../../../GameState/Item/Item';
import { ShopPackets } from '../../../Responses/ShopPackets';
import type { ActionTemplateCallback } from '../ActionTemplateExecutable';

// Define the shop data structure
interface ShopData {
	name: string;
	items: {
		itemId: number;
		price: number;
	}[];
}

// Define our shop data array
const shopData: ShopData[] = [
	// Original test shop data
	{
		name: 'testShop',
		items: [
			{ itemId: 2, price: 50 },
			{ itemId: 3, price: 100 },
		],
	},
	{
		name: 'woodWeaponsmith',
		items: [
			{ itemId: 420001, price: 50 },
			{ itemId: 421001, price: 100 },
			{ itemId: 420101, price: 150 },
			{ itemId: 421101, price: 200 },
			{ itemId: 420201, price: 250 },
			{ itemId: 421201, price: 300 },
			{ itemId: 420301, price: 350 },
			{ itemId: 421301, price: 400 },
		],
	},
	// Additional shops can be added here
];

export const testShop: ActionTemplateCallback = ({ client, game, player }, params) => {
	// Get the shop data based on params or default to first shop
	const shopName = (params?.shopName as string) || 'testShop';
	const shop = shopData.find(s => s.name === shopName);

	if (!shop) {
		// Fallback to original behavior if shop not found
		let item = new Item(game.baseItems.get(2)!);
		item.price = 50;

		let item2 = new Item(game.baseItems.get(3)!);
		item2.price = 100;

		let items = [item, item2];
		player.memory.npcItems = items;
		client.write(...ShopPackets.npcVendor(items));
		return;
	}

	// Create items from shop data
	const items = shop.items.map(itemData => {
		const item = new Item(game.baseItems.get(itemData.itemId)!);
		item.price = itemData.price;
		return item;
	});

	player.memory.npcItems = items;
	client.write(...ShopPackets.npcVendor(items));
};
