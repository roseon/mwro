import { NpcId } from '../../../Data/NpcId';
import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

// This is a test quest to demonstrate item collection.

const QuestId = 1000;

const enum QuestStage {
	// You are asked by A to bring an item to B
	BringItem = 0,
	// B tells you C has to fix the item
	GetFixed = 1,
	// C needs some monster drops to fix it
	CollectItems = 2,
	// C fixes item and you bring it to B
	BringFixed = 3,
}

export const testQuestNpcsData: NpcJson[] = [
	{
		id: NpcId.TestQuestA,
		name: 'Alice',
		direction: Direction.SouthEast,
		file: 104,
		map: MapID.Woodlingor,
		point: { x: 8200, y: 3300 },
		action: [
			{
				type: 'npcSay',
				message: 'Hi, wanna help me out with something?',
				options: [
					{
						text: '#GYeah sure#N',
						action: {
							type: 'npcSay',
							message: [
								'So, I was visiting Bob the other day, and oh dear his place is dusty!' +
									' Turns out he lost his broom, and I told him he could have my old one.',
								"Unfortunately, I'm way too busy to go visit him again, so could you bring it to him?",
							],
							options: [
								{
									text: '#GSure, I got nothing better to do...#N',
									action: {
										type: 'npcSay',
										message:
											'Thank you so much! You can find him outside the Herbal Shop.',
										onClose: [
											{ type: 'quest', add: QuestId },
											{ type: 'addItem', baseItemId: 1000 },
										],
									},
								},
								{
									text: "#YNo, I'm deadly allergic to brooms.#N",
									action: {
										type: 'npcSay',
										message: "You are? Well okay then, I'll find someone else.",
									},
								},
							],
						},
					},
					{
						text: "#YNo, I'm kinda busy.#N",
						action: {
							type: 'npcSay',
							message: 'Well, come back if you change your mind!',
						},
					},
				],
				condition: {
					type: 'quest',
					quest: QuestId,
					not: true,
				},
				else: {
					type: 'npcSay',
					message: 'Did you bring the broom to Bob yet?',
				},
			},
		],
	},
	{
		id: NpcId.TestQuestB,
		name: 'Bob',
		direction: Direction.SouthWest,
		file: 101,
		map: MapID.Woodlingor,
		point: { x: 6360, y: 5200 },
		action: {
			type: 'npcSay',
			message: '~Z2Achoo#E #EOh dear, all this dust is making me sneeze.',
			options: [
				{
					text: '#GYeah, Alice asked me to bring you this broom...#E',
					condition: [
						{ type: 'quest', quest: QuestId, stage: QuestStage.BringItem },
						{ type: 'item', baseItemId: 1000 },
					],
					action: {
						type: 'npcSay',
						message: [
							'Oh thank you very much!',
							'Wait a minute, this broom is broken!',
							"Why don't you ask Charlie to fix it, I'll totes reward you for it.",
						],
						onClose: {
							type: 'quest',
							set: { quest: QuestId, stage: QuestStage.GetFixed },
						},
					},
				},
				{
					text: '#GLook, this broom is all fixed up!#E',
					condition: [
						{ type: 'quest', quest: QuestId, stage: QuestStage.BringFixed },
						{ type: 'item', baseItemId: 1002 },
					],
					action: {
						type: 'npcSay',
						message: 'Hurray! Now I can finally get rid of all this dust!',
						onClose: [
							{ type: 'removeItem', baseItemId: 1002 },
							{ type: 'quest', remove: QuestId },
							{ type: 'exp', amount: 10_000 },
							{ type: 'gold', amount: 10_000 },
						],
					},
				},
			],
		},
	},
	{
		id: NpcId.TestQuestC,
		name: 'Charlie',
		direction: Direction.SouthEast,
		file: 129,
		map: MapID.Woodlingor,
		point: { x: 8110, y: 6688 },
		action: {
			type: 'npcSay',
			message: 'Is this world real? Am I real?',
			options: [
				{
					text: '#GUh, can you fix this broom?#E',
					condition: [
						{ type: 'quest', quest: QuestId, stage: QuestStage.GetFixed },
						{ type: 'item', baseItemId: 1000 },
					],
					action: {
						type: 'npcSay',
						message:
							'Ah yes, this broom reminds me of my grandmother, but it require 5 leaves.',
						options: [
							{
								text: '#GWhy do you need leaves to fix a broom?#E',
								action: {
									type: 'npcSay',
									message:
										"Because I couldn't find a more appropriate image in the game files." +
										' Now go, you can get them from monsters in Revive Arena!',
									onClose: {
										type: 'quest',
										set: { quest: QuestId, stage: QuestStage.CollectItems },
									},
								},
							},
						],
					},
				},
				{
					text: '#GSure.. I got 5 leaves for you.#E',
					condition: [
						{ type: 'quest', quest: QuestId, stage: QuestStage.CollectItems },
						{ type: 'item', baseItemId: 1000 },
						{ type: 'item', baseItemId: 1001, count: 5 },
					],
					action: {
						type: 'npcSay',
						message: "Great, here's your fixed broom!",
						onClose: [
							{ type: 'removeItem', baseItemId: 1000 },
							{ type: 'removeItem', baseItemId: 1001, amount: 5 },
							{ type: 'addItem', baseItemId: 1002 },
							{
								type: 'quest',
								set: { quest: QuestId, stage: QuestStage.BringFixed },
							},
						],
					},
				},
			],
		},
	},
];
