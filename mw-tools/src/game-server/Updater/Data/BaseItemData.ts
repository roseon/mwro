import type { BaseItemJson } from '../../Database/Collections/BaseItem/BaseItemTypes';
import { EquipmentSlot } from '../../Enums/EquipmentSlot';
import { ItemType } from '../../GameState/Item/ItemType';
import { petEggData } from './PetEggData';
import { equipmentItemData } from './EquipmentItemData';
import { healingItemData } from './HealingItemData';
import { teleportItemData } from './TeleportItemData';
import { gemItemData } from './GemItemData';
import { forgeItemData } from './ForgeItemData';
import { sspItemData } from './SSPItemData';
import { miscItemData } from './MiscItemData';

export const baseItemList: BaseItemJson[] = [
	...petEggData,
	...equipmentItemData,
	...healingItemData,
	...teleportItemData,
	...gemItemData,
	...forgeItemData,
	...sspItemData,
	...miscItemData,
	{
		id: 1,
		file: 126,
		name: 'Sword of Whatever',
		description: 'Pointy#E #E#G+5 Boredom',
		type: ItemType.Equipment,
		equipmentSlot: EquipmentSlot.Weapon,
		stackLimit: 1,
		action: null,
		stats: { attack: 5 },
	},
	{
		id: 1000,
		file: 408,
		name: 'Broken Broom',
		description: 'An old broken broom',
		stackLimit: 1,
		type: ItemType.None,
		questItem: true,
	},
	{
		id: 1001,
		file: 11,
		name: 'Leaf',
		description: 'Just a random leaf',
		stackLimit: 30,
		type: ItemType.None,
		questItem: true,
	},
	{
		id: 1002,
		file: 408,
		name: 'Fixed Broom',
		description: 'An old fixed broom',
		stackLimit: 1,
		type: ItemType.None,
		questItem: true,
	},
	{
		id: 1003,
		file: 158,
		name: 'Mokka',
		description: "Mokka's short sword",
		stackLimit: 100,
		type: ItemType.None,
		questItem: true,
	},
];
