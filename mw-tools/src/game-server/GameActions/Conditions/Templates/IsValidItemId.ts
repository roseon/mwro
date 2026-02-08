import type { ConditionTemplateCallback } from '../ConditionTemplateExecutable';

export const isValidItemId: ConditionTemplateCallback = ({ game }, params) => {
	const text = params?.text as string;
	if (!text) return false;

	const itemId = Number(text);
	if (isNaN(itemId) || !Number.isInteger(itemId) || itemId <= 0) return false;

	// Check if the item exists in the game's database
	return game.baseItems.has(itemId);
};
