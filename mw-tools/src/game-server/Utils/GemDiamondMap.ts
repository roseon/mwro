import type { BaseItem } from '../Database/Collections/BaseItem/BaseItemTypes';
import type { Item } from '../GameState/Item/Item';
import { Logger } from '../Logger/Logger';
import { Random } from './Random';

type ColorKey =
	| 'Black'
	| 'Emerald'
	| 'Moonstone'
	| 'Ruby'
	| 'Sapphire'
	| 'Phantasm'
	| 'Purple'
	| 'Glimmering';

// 1) Map each gem‐color → its “+1 Rate” base ID.
const diamondBase: Record<ColorKey, number> = {
	Black: 32101, // uses stride 2 (dual)
	Emerald: 32201, // uses stride 2 (dual)
	Moonstone: 32301, // uses stride 2 (dual)
	Ruby: 32401, // uses stride 2 (dual)
	Sapphire: 32501, // uses stride 2 (dual)
	Phantasm: 32601, // uses stride 1 (single)
	Purple: 32701, // uses stride 1 (single)
	Glimmering: 32801, // uses stride 1 (single)
};

// 2) Define which colors are dual‐stat vs single‐stat.
const dualStatColors = new Set<ColorKey>(['Black', 'Emerald', 'Moonstone', 'Ruby', 'Sapphire']);
const singleStatColors = new Set<ColorKey>(['Phantasm', 'Purple', 'Glimmering']);

/**
 * Given a gem item and the full item array, return one matching Diamond item at random.
 * Returns null if the gem is not convertible or no mapping exists.
 */
export function convertGemItemToDiamondItem(
	gem: Item,
	allItems: Map<number, BaseItem>,
): BaseItem | undefined {
	Logger.warn(`Converting ${gem}`);
	if (!gem.canConvert) return;

	// Extract the color key from the gem’s name: the first word always matches our ColorKey.
	const colorKey = gem.name.split(' ')[0] as ColorKey;
	Logger.warn(`Got gem color ${colorKey}`);

	if (!diamondBase[colorKey]) return;

	const baseId = diamondBase[colorKey];
	const lvl = gem.level;

	if (!lvl) return;

	let chosenId: number;

	if (dualStatColors.has(colorKey)) {
		Logger.warn(`Color is a dual stat diamond`);
		// Dual‐stat: compute two candidates (Rate vs Damage).
		const rateCandidateId = baseId + (lvl - 1) * 2;
		const damageCandidateId = rateCandidateId + 1;
		Logger.warn(`Got IDs, rate: ${rateCandidateId}, damage: ${damageCandidateId}`);

		let rate = allItems.get(rateCandidateId);
		let damage = allItems.get(damageCandidateId);

		if (!rate || !damage) return;

		if (Random.chance(0.5)) {
			return rate;
		} else return damage;
	} else if (singleStatColors.has(colorKey)) {
		Logger.warn(`Color is a single stat diamond`);
		// Single‐stat: there is exactly ONE slot per level
		chosenId = baseId + (lvl - 1);

		return allItems.get(chosenId);
	} else {
		return; // colorKey not recognized
	}

	return;
}

/**
 * Given a gem item and the full item array, return another gem of the same level at random.
 * Excludes the original gem and non-gem items (e.g., diamonds).
 */
export function convertGemItemToGemItem(
	gem: Item,
	allItems: Map<number, BaseItem>,
): BaseItem | undefined {
	if (!gem.canConvert || !gem.level) return;

	const candidates = Array.from(allItems.values()).filter(item => {
		if (!item.canConvert) return false;
		if (item.level !== gem.level) return false;
		if (item.id === gem.id) return false;
		if (!item.name?.includes('Gem')) return false;
		if (item.name.includes('Diamond')) return false;
		return true;
	});

	if (candidates.length === 0) return;

	const index = Random.int(0, candidates.length);
	return candidates[index];
}
