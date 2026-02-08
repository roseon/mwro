import { Item } from '../../../GameState/Item/Item';
import { ShopPackets } from '../../../Responses/ShopPackets';
import { ItemPackets } from '../../../Responses/ItemPackets';
import { ItemListType } from '../../../Enums/ItemListType';
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
	{
		name: 'crabPitShop',
		items: [
			{ itemId: 60000, price: 10000 },
			{ itemId: 60159, price: 1000000 },
			{ itemId: 60160, price: 1000000 },
			{ itemId: 60202, price: 10000 },
			{ itemId: 60203, price: 10000 },
			{ itemId: 20001, price: 1000 },
			{ itemId: 20002, price: 3000 },
			{ itemId: 20003, price: 10000 },
			{ itemId: 20004, price: 1000 },
			{ itemId: 20005, price: 3000 },
			{ itemId: 20006, price: 10000 }, // As requested
			{ itemId: 20007, price: 1000 },
			{ itemId: 20008, price: 3000 },
			{ itemId: 20009, price: 10000 },
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
		let items: Item[] = [];

		const baseItem1 = game.baseItems.get(2);
		if (baseItem1) {
			let item = new Item(baseItem1);
			item.price = 50;
			items.push(item);
		}

		const baseItem2 = game.baseItems.get(3);
		if (baseItem2) {
			let item2 = new Item(baseItem2);
			item2.price = 100;
			items.push(item2);
		}

		player.memory.npcItems = items;
		client.write(...ShopPackets.npcVendor(items));
		return;
	}

	// Create items from shop data
	const items: Item[] = [];
	for (const itemData of shop.items) {
		const baseItem = game.baseItems.get(itemData.itemId);
		if (baseItem) {
			const item = new Item(baseItem);
			item.price = itemData.price;
			items.push(item);
		}
	}

	player.memory.npcItems = items;
	player.memory.shopName = shop.name; // Track the shop name
	client.write(...ShopPackets.npcVendor(items));

	items.forEach((item, index) => {
		client.write(ItemPackets.infoShop(item, index, ItemListType.NpcShop));
	});
};
