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
];
