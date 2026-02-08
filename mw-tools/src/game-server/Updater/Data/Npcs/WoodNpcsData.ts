import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';
import { nurseData } from './NurseData';

export const WoodNpcsData: NpcJson[] = [
	{
		id: 0x80000077,
		name: 'Messenger',
		file: 111,
		map: MapID.Woodlingor,
		point: { x: 1040, y: 920 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'I have nothing to tell you. #46 Seek out the Whisperor and ask him about rumors.',
		},
	},
	{
		id: 0x80000112,
		name: 'Healer (Shop)',
		file: 103,
		map: MapID.Woodlingor,
		point: { x: 1728, y: 5120 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'What can I get for you?',
			options: [
				{
					text: '#GShop me? #17#E',
					action: { type: 'template', template: 'testShop' },
				},
				{ text: "I'm not interested." },
			],
		},
	},
	{
		id: 0x80000124,
		name: 'Messenger',
		file: 111,
		map: MapID.Woodlingor,
		point: { x: 208, y: 6040 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'I have nothing to tell you. #46 Seek out the Whisperor and ask him about rumors.',
		},
	},

	{
		id: 0x80000154,
		name: 'Thief',
		file: 109,
		map: MapID.Woodlingor,
		point: { x: 2720, y: 4920 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Scram!',
		},
	},
	{
		id: 0x80000157,
		name: 'Warrior Lisa',
		file: 108,
		map: MapID.Woodlingor,
		point: { x: 2784, y: 1200 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Ever since the Mage War, Woodlingor has been center of peace.',
		},
	},
	{
		id: 0x80000160,
		name: 'Death Avian',
		file: 243,
		map: MapID.Woodlingor,
		point: { x: 2832, y: 5960 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000171,
		name: 'Girl Thief',
		file: 2,
		map: MapID.Woodlingor,
		point: { x: 3040, y: 1000 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Leave me alone!',
		},
	},
	{
		id: 0x80000183,
		name: 'Archer George',
		file: 109,
		map: MapID.Woodlingor,
		point: { x: 3328, y: 3944 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000186,
		name: 'Death Beast',
		file: 239,
		map: MapID.Woodlingor,
		point: { x: 352, y: 6320 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000191,
		name: 'Hawker',
		file: 104,
		map: MapID.Woodlingor,
		point: { x: 3712, y: 2736 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000192,
		name: 'Gambler John',
		file: 130,
		map: MapID.Woodlingor,
		point: { x: 3744, y: 1000 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: "I don't have a gambling problem, I have a winning problem.",
		},
	},
	{
		id: 0x80000194,
		name: 'Translar',
		file: 131,
		map: MapID.Woodlingor,
		point: { x: 3760, y: 640 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message:
				'When all of the following conditions are met, come to me to rebirth your pet #eMaximum Pet Level#eIntimacy Value of 50000#e50 Reputation Points#e2 Million Gold.',
			options: [
				{
					text: '#gI will rebirth my pet.#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: "#gI don't want to rebirth my pet.#e",
					action: { type: 'exp', amount: 1000 },
				},
			],
		},
	},
	{
		id: 0x80000204,
		name: 'Reborn Stats',
		file: 111,
		map: MapID.Woodlingor,
		point: { x: 4016, y: 440 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'The growth rates of your race upon rebirth are;#eStamina:#eIntelligence:#eStrength:#eAgility:',
		},
	},
	{
		id: 0x80000206,
		name: 'Buyer',
		file: 129,
		map: MapID.Woodlingor,
		point: { x: 4064, y: 1960 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'I can buy your items.',
		},
	},
	{
		id: 0x80000207,
		name: 'Diana',
		file: 122,
		map: MapID.Woodlingor,
		point: { x: 4112, y: 6800 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000211,
		name: 'Elder of Faith',
		file: 132,
		map: MapID.Woodlingor,
		point: { x: 4192, y: 496 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'Hopefully one day a brave and powerful adventurer will collect the 5 Soulstones and elevate themselves in the name of Woodlingor.',
		},
	},
	{
		id: 0x80000213,
		name: 'RebornGuardian',
		file: 160,
		map: MapID.Woodlingor,
		point: { x: 4256, y: 680 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'You are not yet worthy of rebirth.',
		},
	},
	{
		id: 0x80000227,
		name: 'Sister Alice',
		file: 114,
		map: MapID.Woodlingor,
		point: { x: 4768, y: 2600 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000242,
		name: 'Whisperor',
		file: 117,
		map: MapID.Woodlingor,
		point: { x: 5136, y: 352 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message: 'Give me a rumor scroll and I will help spread the word.',
		},
	},
	{
		id: 0x80000246,
		name: 'Messenger',
		file: 111,
		map: MapID.Woodlingor,
		point: { x: 5200, y: 368 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message:
				'I have nothing to tell you. #46 Seek out the Whisperor and ask him about rumors.',
		},
	},
	{
		id: 0x80000248,
		name: 'Death Warrior',
		file: 201,
		map: MapID.Woodlingor,
		point: { x: 528, y: 1240 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000253,
		name: 'Nurse',
		file: 114,
		map: MapID.Woodlingor,
		point: { x: 5312, y: 1712 },
		direction: Direction.SouthWest,
		action: nurseData,
	},
	{
		id: 0x80000261,
		name: 'Recycler',
		file: 124,
		map: MapID.Woodlingor,
		point: { x: 5520, y: 6560 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'I can recycle your items.',
		},
	},
	{
		id: 0x80000262,
		name: 'Defender',
		file: 109,
		map: MapID.Woodlingor,
		point: { x: 5568, y: 680 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'Denizens of Woodlingor have reported strange activity from one of the shopkeepers.',
		},
	},
	{
		id: 0x80000266,
		name: 'Master Tracker',
		file: 110,
		map: MapID.Woodlingor,
		point: { x: 5760, y: 1040 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Tell me the ID of the person you wish to find.',
		},
	},
	{
		id: 0x80000269,
		name: 'Messenger',
		file: 111,
		map: MapID.Woodlingor,
		point: { x: 5968, y: 2360 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'I have nothing to tell you. #46 Seek out the Whisperor and ask him about rumors.',
		},
	},
	{
		id: 0x80000274,
		name: 'Death Spirit',
		file: 251,
		map: MapID.Woodlingor,
		point: { x: 6240, y: 6160 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000278,
		name: 'Buyer',
		file: 129,
		map: MapID.Woodlingor,
		point: { x: 6400, y: 5200 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'I can buy your items!',
		},
	},
	{
		id: 0x80000280,
		name: 'Map Merchant',
		file: 119,
		map: MapID.Woodlingor,
		point: { x: 6512, y: 2400 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'A measely 500 gold for a potential fortune?!',
			options: [
				{
					text: '#gBuy a map #y(500 gold)#e',
					action: { type: 'exp', amount: 1000 },
				},
				{ text: "#gI'm not falling for that.#E" },
			],
		},
	},
	{
		id: 0x80000283,
		name: 'Thief Boss',
		file: 126,
		map: MapID.Woodlingor,
		point: { x: 6640, y: 5520 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message: 'Leave now or else!',
		},
	},
	{
		id: 0x80000285,
		name: 'Death Skeleton',
		file: 211,
		map: MapID.Woodlingor,
		point: { x: 672, y: 2680 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000287,
		name: 'Soldier Johnny',
		file: 107,
		map: MapID.Woodlingor,
		point: { x: 672, y: 6160 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: '',
		},
	},
	{
		id: 0x80000288,
		name: 'Capilla',
		file: 254,
		map: MapID.Woodlingor,
		point: { x: 6720, y: 1680 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000291,
		name: 'Nurse',
		file: 114,
		map: MapID.Woodlingor,
		point: { x: 6880, y: 1600 },
		direction: Direction.SouthWest,
		action: nurseData,
	},
	{
		id: 0x80000292,
		name: 'Messenger',
		file: 111,
		map: MapID.Woodlingor,
		point: { x: 6960, y: 5360 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message:
				'I have nothing to tell you. #46 Seek out the Whisperor and ask him about rumors.',
		},
	},
	{
		id: 0x80000294,
		name: 'Porter',
		file: 124,
		map: MapID.Woodlingor,
		point: { x: 7040, y: 1840 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'I can help you navigate Woodlingor faster.',
			options: [
				{
					text: '#gTake me to the Weapon Shop.#e',
					action: {
						type: 'teleport',
						coordinates: {
							map: MapID.WoodlingorWeaponry,
							x: 20,
							y: 50,
						},
					},
				},
				{
					text: '#gTake me to the Armor Shop.#e',
					action: {
						type: 'teleport',
						coordinates: {
							map: MapID.WoodlingorArmory,
							x: 24,
							y: 59,
						},
					},
				},
				{
					text: '#gTake me to the Accessory Shop.#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: '#gTake me to the Healer.#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: '#gTake me to the Bank.#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: "#gI don't need any help.#e",
				},
			],
		},
	},
	{
		id: 0x80000295,
		name: 'Town Guide',
		file: 111,
		map: MapID.Woodlingor,
		point: { x: 7120, y: 1440 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'What do you need help with?',
			options: [
				{
					text: '#gWhat quests can I do?#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: '#gWhere can I purchase new equipment?#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: '#gWhere can I hunt monsters?#e',
					action: { type: 'exp', amount: 1000 },
				},
			],
		},
	},
	{
		id: 0x80000298,
		name: 'Rowdy Tourist',
		file: 238,
		map: MapID.Woodlingor,
		point: { x: 720, y: 3360 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'I am a mere adventurer.',
		},
	},
	{
		id: 0x80000299,
		name: 'Stonesmith',
		file: 117,
		map: MapID.Woodlingor,
		point: { x: 7280, y: 1240 },
		direction: Direction.East,
		action: [
			{
				condition: { type: 'quest', quest: 1005, stage: 0 },
				type: 'npcSay',
				message: 'Have you found the 8 lost items yet?',
				options: [
					{
						text: '#gYes, I have them right here.#e',
						condition: { type: 'item', baseItemId: 3000, count: 8 },
						action: {
							type: 'npcSay',
							message: 'Thank you! These are exactly what I needed. Here is your reward.',
							onClose: [
								{ type: 'removeItem', baseItemId: 3000, amount: 8 },
								{ type: 'quest', remove: 1005 },
								{ type: 'exp', amount: 120000 },
								{ type: 'gold', amount: 100000 },
								{ type: 'exp', amount: 120000, pet: true },
							],
						},
					},
					{
						text: '#gI am still working on it.#e',
						action: {
							type: 'npcSay',
							message: 'Please hurry, I need them soon.',
						},
					},
				],
			},
			{
				condition: { type: 'quest', quest: 1005, not: true },
				type: 'npcSay',
				message: 'Want to help me? I need 8 lost items. Please collect them for me from monsters in Revive Arena.',
				options: [
					{
						text: '#gI will help you.#e',
						action: {
							type: 'npcSay',
							message: 'Thank you! Please bring me 8 Lost Items.',
							onClose: { type: 'quest', add: 1005 },
						},
					},
					{
						text: '#gGet them yourself.#e',
						action: {
							type: 'npcSay',
							message: 'How rude!',
						},
					},
				],
			},
		],
	},
	{
		id: 0x80000300,
		name: 'Battleground',
		file: 120,
		map: MapID.Woodlingor,
		point: { x: 7280, y: 1840 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message: 'Come to me during the time of war and I will take you to the battleground.',
		},
	},
	{
		id: 0x80000301,
		name: 'Compensator',
		file: 106,
		map: MapID.Woodlingor,
		point: { x: 7280, y: 4800 },
		direction: Direction.NorthEast,
		action: {
			type: 'npcSay',
			message:
				"I'm the compensator. I will compensate you for your lossess incurred during natural disasters.",
		},
	},
	{
		id: 0x80000302,
		name: 'Map Tester',
		file: 134,
		map: MapID.Woodlingor,
		point: { x: 7168, y: 5248 },
		direction: Direction.SouthWest,
		action: {
			type: 'template',
			template: 'mapTester',
		},
	},
	{
		id: 0x80000303,
		name: 'Unmute',
		file: 118,
		map: MapID.Woodlingor,
		point: { x: 7360, y: 1600 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Once your mute time is over, come to me to pay your fine.',
		},
	},
	{
		id: 0x80000304,
		name: 'Crab Pit',
		file: 120,
		map: MapID.Woodlingor,
		point: { x: 7360, y: 4440 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message: 'The Crab Pit is open Mon/Wed 19:00 and Fri 15:00. We welcome you to take part in the fun.',
			options: [
				{
					text: 'Enter Crab Pit',
					action: {
						type: 'template',
						template: 'crabPitEnter'
					}
				},
				{
					text: '#YClose#E'
				}
			]
		},
	},
	{
		id: 0x80000309,
		name: 'Andreen',
		file: 123,
		map: MapID.Woodlingor,
		point: { x: 7440, y: 4960 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000311,
		name: 'Ticket Lady',
		file: 115,
		map: MapID.Woodlingor,
		point: { x: 752, y: 5664 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'I hope one day I can offer you a ticket to foreign lands.',
		},
	},
	{
		id: 0x80000312,
		name: 'Capilla',
		file: 254,
		map: MapID.Woodlingor,
		point: { x: 7520, y: 1240 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000315,
		name: 'Brave Angel',
		file: 134,
		map: MapID.Woodlingor,
		point: { x: 7680, y: 960 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message:
				'Have you ever been to #rRevive Arena#w at Woodlingor? I need a warrior to complete a task for me.',
			options: [
				{
					text: '#gOk! Let me try!#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: "#gI'm not ready.#e",
					action: { type: 'exp', amount: 1000 },
				},
			],
		},
	},
	{
		id: 0x80000316,
		name: 'New Horizon',
		file: 159,
		map: MapID.Woodlingor,
		point: { x: 7760, y: 1200 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'Want to be a New Horizon? Go to #yWoodling (X,Y)#w and look for the Brave Angel.',
		},
	},
	{
		id: 0x80000317,
		name: 'Bank Teller',
		file: 113,
		map: MapID.Woodlingor,
		point: { x: 7760, y: 2800 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message: 'Withdraw or deposit items here.',
			options: [
				{
					text: '#gWithdraw items.#e',
					action: { type: 'bank', operation: 'withdraw' },
				},
				{
					text: '#gDeposit items.#e',
					action: { type: 'bank', operation: 'deposit' },
				},
				{
					text: '#gDeposit gold.#e',
					action: { type: 'bank', operation: 'depositGold' },
				},
				{
					text: '#gWithdraw gold.#e',
					action: { type: 'bank', operation: 'withdrawGold' },
				},
			],
		},
	},

	{
		id: 0x80000320,
		name: 'Redeem Steward',
		file: 106,
		map: MapID.Woodlingor,
		point: { x: 7840, y: 1720 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'You can redeem your quest points here. I can also help you abandon uncompleted quests.',
			options: [
				{
					text: '#gCheck my quest points.#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: '#gI want to redeem.#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: '#gAbandon a quest.#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: "#gThat's all.#e",
					action: { type: 'exp', amount: 1000 },
				},
			],
		},
	},
	{
		id: 0x800018d0,
		name: 'Elder Registrar',
		file: 111,
		map: MapID.WoodlingorEldersZone,
		point: { x: 208, y: 368 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Do you want to delete this character? This cannot be undone.',
			options: [
				{
					text: '#rDelete my character.#e',
					action: { type: 'template', template: 'deleteCharacter' },
				},
				{ text: '#gCancel.#e' },
			],
		},
	},
	{
		id: 0x800018d1,
		name: 'Skill Trainer',
		file: 111,
		map: MapID.WoodlingorSkillCenter,
		point: { x: 800, y: 312 },
		direction: Direction.SouthWest,
		action: {
			condition: { type: 'quest', quest: 2000, not: true },
			type: 'npcSay',
			message:
				'You are ready for Skill II. Visit me at level 20 and I will guide you to the Skill II Token.',
			options: [
				{
					text: '#gI am ready.#e',
					condition: { type: 'level', min: 20 },
					action: { type: 'quest', add: 2000 },
				},
				{ text: '#gNot yet.#e' },
			],
			else: {
				condition: { type: 'quest', quest: 2000, stage: 0 },
				type: 'npcSay',
				message:
					'Bring me the Skill II Token from Revive Arena and I will unlock your Skill II.',
				options: [
					{
						text: '#gHere is the token.#e',
						condition: { type: 'item', baseItemId: 20007, count: 1 },
						action: { type: 'template', template: 'unlockSkillII' },
					},
					{ text: '#gI will return.#e' },
				],
				else: {
					condition: { type: 'quest', quest: 60002, not: true },
					type: 'npcSay',
					message:
						'At level 50, you may challenge Drowcrusher in Demon Square to unlock Skill III and IV.',
					options: [
						{
							text: '#gI am ready.#e',
							condition: { type: 'level', min: 50 },
							action: { type: 'quest', add: 60002 },
						},
						{ text: '#gNot yet.#e' },
					],
					else: {
						condition: { type: 'quest', quest: 60002, stage: 0 },
						type: 'npcSay',
						message:
							'Go to Demon Square and challenge Drowcrusher with your class boots +5 to unlock Skill III and IV.',
					},
				},
			},
		},
	},
	{
		id: 0x80000321,
		name: 'Citizen Kane',
		file: 101,
		map: MapID.Woodlingor,
		point: { x: 7840, y: 6200 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'I am a lawful citizen of Woodlingor. Adventurer you look familiar, have we met before?',
		},
	},
	{
		id: 0x80000322,
		name: 'Love Angel',
		file: 134,
		map: MapID.Woodlingor,
		point: { x: 7920, y: 880 },
		direction: Direction.SouthEast,
	},
	{
		id: 0x80000325,
		name: 'Capilla',
		file: 254,
		map: MapID.Woodlingor,
		point: { x: 8160, y: 1040 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000326,
		name: 'Help Newbie',
		file: 134,
		map: MapID.Woodlingor,
		point: { x: 8160, y: 2000 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'Experienced players are encouraged to help starters through the "Help Newbie" campaign.',
			options: [
				{
					text: '#gOkay, I would like to help.#e',
					action: { type: 'exp', amount: 1000 },
				},
				{
					text: "#gI don't have time.#e",
					action: { type: 'exp', amount: 1000 },
				},
			],
		},
	},
	{
		id: 0x80000327,
		name: 'Duke William',
		file: 119,
		map: MapID.Woodlingor,
		point: { x: 8192, y: 5200 },
		direction: Direction.SouthWest,
	},
	{
		id: 0x80000339,
		name: 'Nurse',
		file: 114,
		map: MapID.Woodlingor,
		point: { x: 8240, y: 5200 },
		direction: Direction.SouthWest,
		action: nurseData,
	},
	{
		id: 0x80000328,
		name: 'Carnival',
		file: 123,
		map: MapID.Woodlingor,
		point: { x: 8240, y: 2240 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				"#gDon't hesitate to report any player who uses hack programs to a GM. We will take action against them.",
		},
	},
	{
		id: 0x80000329,
		name: 'Nurse',
		file: 114,
		map: MapID.Woodlingor,
		point: { x: 8320, y: 3320 },
		direction: Direction.SouthWest,
		action: nurseData,
	},
	{
		id: 0x80000330,
		name: 'Drunkard Fenny',
		file: 113,
		map: MapID.Woodlingor,
		point: { x: 8480, y: 6320 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: "I owe the bartender a lot of gold, so I'm not in the mood to talk.",
		},
	},
	{
		id: 0x80000340,
		name: 'Nurse',
		file: 114,
		map: MapID.Woodlingor,
		point: { x: 8520, y: 6320 },
		direction: Direction.SouthWest,
		action: nurseData,
	},
	{
		id: 0x80000338,
		name: 'Ticket Lady',
		file: 115,
		map: MapID.Woodlingor,
		point: { x: 992, y: 784 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'I hope one day I can offer you a ticket to foreign lands.',
		},
	},
	{
		id: 0x80000341,
		name: 'Pet Market',
		file: 111,
		map: MapID.Woodlingor,
		point: { x: 8400, y: 1200 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Welcome to the test pet system! Select an option below.',
			options: [
				{
					text: '#GAdd Pet#E',
					action: { type: 'template', template: 'addPets' },
				},
				{
					text: '#YClose#E',
				},
			],
		},
	},
	{
		id: 0x80009902,
		name: 'Crab Pit Coordinator',
		file: 112,
		map: MapID.Woodlingor,
		point: { x: 3000, y: 3000 },
		direction: Direction.South,
		action: {
			type: 'npcSay',
			message: 'Welcome to the Crab Pit! Roll the dice to qualify for catching crabs!',
			options: [
				{
					text: 'Roll Dice',
					action: {
						type: 'template',
						template: 'crabPitRoll'
					}
				},
				{
					text: 'Leave',
					action: {
						type: 'teleport',
						coordinates: {
							map: MapID.Woodlingor,
							x: 1040,
							y: 960
						}
					}
				}
			]
		},
	},
];
