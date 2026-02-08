import type { GameAction } from '../../../GameActions/GameActionTypes';

export const nurseData: GameAction = {
	type: 'npcSay',
	message: 'Would you like me to put a bandade on?',
	options: [
		{
			condition: { type: 'gold', amount: 100 },
			text: '#GHeal me please (100 gold)#E',
			action: [
				{
					type: 'gold',
					amount: -100,
				},
				{
					type: 'heal',
					hp: 100,
					mp: 100,
					isPerc: true,
				},
				{
					type: 'heal',
					hp: 100,
					mp: 100,
					pet: true,
					isPerc: true,
				},
			],
		},
		{
			condition: { type: 'gold', amount: 100, not: true },
			text: '#RHeal me please (100 gold)#E',
			action: {
				type: 'npcSay',
				message: 'Sorry, you cant afford my services right now.',
			},
		},
		{ text: '#YClose#E' },
	],
};
