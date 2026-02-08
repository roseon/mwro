import type { BaseItemJson } from '../../Database/Collections/BaseItem/BaseItemTypes';
import { ItemType } from '../../GameState/Item/ItemType';

export const miscItemData: BaseItemJson[] = [
	//items that don't fit into other categories or are just singular in nature
	{
		id: 2000,
		file: 24,
		name: "Devil's Tears",
		description: 'Repel monsters of a lower level than you',
		type: ItemType.Consumable,
		stackLimit: 20,
		action: {
			type: 'monsterRepel',
			duration: 20 * 60 * 1000,
			applyEffect: true,
		},
	},
	{
		id: 3000,
		file: 31, // Generic item icon
		name: 'Lost Item',
		description: 'A lost item for the Stonesmith.',
		type: ItemType.Quest,
		stackLimit: 20,
	},
	{
		id: 3001,
		file: 32, // Generic item icon
		name: 'Mokka',
		description: 'A magical bean that increases skill points.',
		type: ItemType.Consumable,
		stackLimit: 99,
	},
];
