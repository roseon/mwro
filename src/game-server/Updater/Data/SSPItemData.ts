import type { BaseItemJson } from '../../Database/Collections/BaseItem/BaseItemTypes';
import { ItemType } from '../../GameState/Item/ItemType';
import type { GameAction } from '../../GameActions/GameActionTypes';
import { FightStatJson } from '../../GameState/Fight/FightStats';
import { formatFightStatJson } from '../../Utils/StringUtils';
//file ids
//344 item for ssp
//37 reductive potion

// Template for the SSP dialog
const sspTemplate = {
	type: 'npcSay' as const,
	getMessage: (monsterName: string) =>
		`Would you like to use the Shapeshift Potion containing the essence of#g${monsterName}#n?`,
	options: [
		{
			text: '#GYes #48#n#E',
			getAction: (monsterData: {
				name: string;
				file: number;
				stats: FightStatJson;
			}): GameAction => ({
				type: 'array' as const,
				actions: [
					{
						type: 'shapeShift' as const,
						...monsterData,
					},
					{
						type: 'removeLastItemUsed' as const,
					},
				],
			}),
		},
		{
			text: '#RNo, not now#E',
		},
	] as const,
};

// Helper function to format resistance names
const formatResistName = (resist: string): string => {
	const hasResist = resist.includes('Resist');
	// Remove 'Resist' suffix if it exists
	const baseName = resist.replace('Resist', '');
	// Split camelCase and capitalize first letter
	const formatted = baseName.replace(/([A-Z])/g, ' $1').trim();
	return (
		formatted.charAt(0).toUpperCase() + formatted.slice(1) + (hasResist ? ' Resistance' : '')
	);
};

// Helper function to create SSP items
const createSSPItem = (
	id: number,
	monsterName: string,
	file: number,
	stats: FightStatJson,
): BaseItemJson => ({
	id,
	file: 344,
	name: 'Shapeshift Potion',
	description: `Contains Essence of #c00FFFF#e${monsterName}#n#e${formatFightStatJson(stats).join(', ')}`,
	type: ItemType.Usable,
	stackLimit: 1,
	action: {
		type: sspTemplate.type,
		message: sspTemplate.getMessage(monsterName),
		options: [
			{
				text: sspTemplate.options[0]!.text,
				action: (() => {
					const [yesOption] = sspTemplate.options;
					return yesOption.getAction({
						name: monsterName,
						file,
						stats,
					});
				})(),
			},
			sspTemplate.options[1]!,
		],
	},
});

export const sspItemData: BaseItemJson[] = [
	{
		id: 700000,
		file: 37,
		name: 'Reductive Potion',
		description: 'Reverts you to your original form.',
		type: ItemType.Consumable,
		stackLimit: 1,
		action: {
			type: 'shapeShift',
			name: 'Original Form',
			file: 0, // The actual original file ID will be handled in the executable
			stats: {},
		},
	},

	createSSPItem(701205, 'Ant Eater', 205, { hp: 7, meleeResist: 10 }),
	createSSPItem(701226, 'Aurora Lion', 226, { hp: 10, drainResist: 10 }),
	createSSPItem(701201, 'Ghost Warrior', 201, { attack: 14, berserkRate: 10, berserkDamage: 10 }),
];
