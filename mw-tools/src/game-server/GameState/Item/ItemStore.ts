import type { Item } from './Item';
import { ItemContainer } from './ItemContainer';
import { CharacterRace } from '../../Enums/CharacterClass';

export class ItemStore {
	public items: number[] = [];
	public lastTradeDalant: number = 0;
	public lastTradeGold: number = 0;
	public raceCode: CharacterRace | -1 = -1;

	public constructor(items: number[]) {
		this.items = items;
	}

	public getStoreItems(): number[] {
		return this.items;
	}

	public isSell(
		item: Item,
		amount: number,
		hasGold: number,
		discountRate: number = 1.0,
	): { success: boolean; errorCode?: string } {
		const price = this.calcSellPrice(item, discountRate);
		// Check gold
		if (price * amount > hasGold) {
			return { success: false, errorCode: 'FundLack' };
		}
		
		// Space check should be done by the caller (ItemContainer)

		return { success: true };
	}

	public isBuy(
		item: Item,
		amount: number,
		discountRate: number = 1.0
	): { success: boolean; errorCode?: string } {
		// Logic to check if the store buys this item
        // e.g. check if item is sellable
        if (item.price === 0) { // Assuming 0 price items are not sellable
             return { success: false, errorCode: 'NotDealing' };
        }
		return { success: true };
	}

    public isRepair(
        item: Item,
        hasGold: number
    ): { success: boolean; errorCode?: string } {
        // Repair logic: calculate cost based on durability
        // For now, simple placeholder
        const repairCost = 10; // Placeholder
        if (repairCost > hasGold) {
             return { success: false, errorCode: 'FundLack' };
        }
        return { success: true };
    }

	public calcSellPrice(item: Item, discountRate: number = 1.0): number {
		// Store selling price
		return Math.floor(item.price * discountRate);
	}

    public calcBuyPrice(item: Item, discountRate: number = 1.0): number {
        // Store buying price (usually lower)
        return Math.floor(item.price * 0.5 * discountRate); // 50% buyback
    }
}
