import { type NpcJson, NpcType } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const SkyPassNpcsData: NpcJson[] = [
	{
		id: 0x80000086,
		name: 'Mage Sage',
		file: 15,
		map: MapID.SkyPassage,
		point: { x: 1040, y: 1152 },
		direction: Direction.SouthEast,
		action: [
			{
				condition: {
					type: 'level',
					max: 1,
				},
				type: 'exp',
				amount: 1000,
			},
			{
				type: 'npcSay',
				message:
					'I am the #rMage Sage#w, I can teach you the basics of being a Mage.#eWhat would you like to learn?',
				options: [
					{
						text: '#gTell me about the Mage class.',
						action: {
							type: 'array',
							actions: [
								{
									type: 'npcSay',
									message:
										'The Mage is a class that specializes in the use of magic. They possess weaker physical attributes, but their magical abilities can devastate their enemies. Rely on hearty tank pets or Centaurs to keep them alive.',
								},
							],
						},
					},
					{
						text: '#gTell me about Mage Stats.',
						action: {
							type: 'npcSay',
							message:
								'INT is the most important stat for a Mage. It increases the amount of mana you have, as well as the damage of your spells. AGI can also prove useful, allowing you to cast before your opponents.',
						},
					},
					{
						text: "#gI've heard enough.",
						action: {
							type: 'array',
							actions: [
								{
									type: 'npcSay',
									message:
										"Apply stat points from the Character Status window (#yAlt+W#w or left click the character avatar in the top left of the screen) and then I believe you're ready to challenge the Battle Instructor!",
								},
								{ type: 'quest', set: { quest: 1001, stage: 1 } },
							],
						},
					},
				],
			},
		],
	},
	{
		id: 0x80000087,
		name: 'Chaos Wisp',
		file: 220,
		map: MapID.SkyPassage,
		point: { x: 1120, y: 1040 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message:
				'I am the #rChaos Wisp#w, deity of Intelligence. My magic skills are more potent than most pets.',
		},
	},
	{
		id: 0x80000088,
		name: 'Pet Keeper',
		file: 131,
		map: MapID.SkyPassage,
		point: { x: 1152, y: 672 },
		direction: Direction.SouthWest,
		type: NpcType.Pet,
		action: [
			{
				condition: {
					type: 'level',
					min: 2,
				},
				type: 'npcSay',
				message:
					'I am the #rPet Keeper#w. Give me a Pet Egg to hatch a pet. Use #wAlt+G#w or click the give icon on the hotbar, then click on me and select the Pet Egg.',
			},
			{
				condition: [
					{
						type: 'hasPet',
					},
					{
						type: 'quest',
						quest: 1002,
						stage: 0,
					},
				],
				type: 'array',
				actions: [
					{
						type: 'npcSay',
						message:
							'I have hatched your pet. Now you can set it to active to fight alongside you in battle. Open the Pet window with either #yAlt+P#w or left clicking the pawprint icon undearneath the player avatar in the top left of the screen. Select the #rBloodpede#w and the press #yActive#w.',
						onClose: { type: 'quest', set: { quest: 1002, stage: 2 } },
					},
				],
			},
			{
				condition: [
					{
						type: 'petLevel',
						min: 1,
					},
					{
						type: 'quest',
						quest: 1002,
						stage: 2,
					},
				],
				type: 'array',
				actions: [
					{
						type: 'npcSay',
						message: 'Congratulations on your new pet! I hope you treat it well.',
					},
					{ type: 'quest', remove: 1002 },
					{ type: 'exp', amount: 2125, pet: true },
				],
			},
			{
				condition: {
					type: 'quest',
					quest: 1002,
					not: true,
				},
				type: 'npcSay',
				message:
					'With your new pet in tow, go and seek the Instructor near the Teleporter to get your first armor and next steps.',
			},
		],
	},
	{
		id: 0x80000089,
		name: 'Borg Sage',
		file: 17,
		map: MapID.SkyPassage,
		point: { x: 2080, y: 1328 },
		direction: Direction.SouthEast,
		action: [
			{
				condition: {
					type: 'level',
					max: 1,
				},
				type: 'exp',
				amount: 1000,
			},
			{
				type: 'npcSay',
				message:
					'I am the #rBorg Sage#w, I can teach you the basics of being a Borg.#eWhat would you like to learn?',
				options: [
					{
						text: '#gTell me about the Borg class.',
						action: {
							type: 'array',
							actions: [
								{
									type: 'npcSay',
									message:
										'The borg is a very versatile class. They can play both offensively: draining enemies HP and MP simultaneously or using powerful melee attacks, or defensively: applying buffs to themselves and teammates.',
								},
							],
						},
					},
					{
						text: '#gTell me about Borg Stats.',
						action: {
							type: 'npcSay',
							message:
								'Borgs excel at STR to bolster their melee damage. They can also benefit from high AGI allowing them to apply buffs or drain enemies HP and MP quickly, or even STA to protect allies.',
						},
					},
					{
						text: "#gI've heard enough.",
						action: {
							type: 'array',
							actions: [
								{
									type: 'npcSay',
									message:
										"Apply stat points from the Character Status window (#yAlt+W#w or left click the character avatar in the top left of the screen) and then I believe you're ready to challenge the Battle Instructor!",
								},
								{ type: 'quest', set: { quest: 1001, stage: 1 } },
							],
						},
					},
				],
			},
		],
	},
	{
		id: 0x80000090,
		name: 'Human Sage',
		file: 11,
		map: MapID.SkyPassage,
		point: { x: 2304, y: 1872 },
		direction: Direction.SouthWest,
		action: [
			{
				condition: {
					type: 'level',
					max: 1,
				},
				type: 'exp',
				amount: 1000,
			},
			{
				type: 'npcSay',
				message:
					'I am the #rHuman Sage#w, I can teach you the basics of being a Human.#eWhat would you like to learn?',
				options: [
					{
						text: '#gTell me about the Human class.',
						action: {
							type: 'array',
							actions: [
								{
									type: 'npcSay',
									message:
										'The primary objective for a Human is to take control of the battle flow by applying Chaos and Hypno to their enemies. Applying Poison (Female only) or Frailty (Male only) to further weaken their opponents. Stun is effective as a last resort to prevent an enemy taking a turn however whilst stunned they are impervious to any damage.',
								},
							],
						},
					},
					{
						text: '#gTell me about Human Stats.',
						action: {
							type: 'npcSay',
							message:
								'Humans primary stat is the STA stat, increasing the maximum HP. INT also applies a small bonus to control skills such as Chaos and Hypno.',
						},
					},
					{
						text: "#gI've heard enough.",
						action: {
							type: 'array',
							actions: [
								{
									type: 'npcSay',
									message:
										"Apply stat points from the Character Status window (#yAlt+W#w or left click the character avatar in the top left of the screen) and then I believe you're ready to challenge the Battle Instructor!",
								},
								{ type: 'quest', set: { quest: 1001, stage: 1 } },
							],
						},
					},
				],
			},
		],
	},
	{
		id: 0x80000091,
		name: 'Berserker',
		file: 228,
		map: MapID.SkyPassage,
		point: { x: 2192, y: 1272 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'I am the #rBerserker#w, deity of #yStrength#w. A potent attacker',
		},
	},
	{
		id: 0x80000092,
		name: 'Dark Dream',
		file: 243,
		map: MapID.SkyPassage,
		point: { x: 2128, y: 1904 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message: 'I am the #rDark Dream#w, deity of #ySpeed#w. Almost certain to strike first.',
		},
	},
	{
		id: 0x80000093,
		name: 'Andreen',
		file: 123,
		map: MapID.SkyPassage,
		point: { x: 2752, y: 1736 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message: 'Look out for my sister in Woodlingor to collect pending mall items!',
		},
	},
	{
		id: 0x80000094,
		name: 'Grimreaper',
		file: 126,
		map: MapID.SkyPassage,
		point: { x: 288, y: 656 },
		direction: Direction.NorthEast,
		action: {
			type: 'npcSay',
			message:
				'One day I will be powerful enough to delete characters, freeing up slots in your account for new ones.',
		},
	},
	{
		id: 0x80000095,
		name: 'Battle Instructor',
		file: 125,
		map: MapID.SkyPassage,
		point: { x: 2880, y: 640 },
		direction: Direction.SouthWest,
		action: [
			{
				type: 'npcSay',
				message: 'Go ahead and talk to the newbie guide before you challenge me.',
			},
			{
				condition: {
					type: 'quest',
					quest: 1001,
					stage: 1,
				},
				type: 'npcSay',
				message: 'Are you ready to challenge me?',
				options: [
					{
						text: "#GI'm ready!#E",
						action: {
							type: 'npcSay',
							message:
								'Use "Attack" to perform a melee attack.#e"Skill" allows you to use one of your class skills (At the cost of MP).#e"Dodge" will reduce damange taken from physical attacks.#eThe "Defend" command causes you to take damage on behalf of an ally.#eKeep your HP and MP up with items from your "Bag".',
							onClose: { type: 'template', template: 'battleInstructorFight' },
						},
					},
					{ text: "#YI'm not ready yet#E" },
				],
			},
		],
	},
	{
		id: 0x80000096,
		name: 'Aurora Lion',
		file: 226,
		map: MapID.SkyPassage,
		point: { x: 2928, y: 2040 },
		direction: Direction.NorthEast,
		action: {
			type: 'npcSay',
			message:
				'I am mostly known for my stalwart defense and my ability to withstand attacks. Aurora Lions are a rare pet to come by.',
		},
	},
	{
		id: 0x80000097,
		name: 'Newbie Guide',
		file: 121,
		map: MapID.SkyPassage,
		point: { x: 3008, y: 1616 },
		direction: Direction.SouthWest,
		action: [
			{
				type: 'npcSay',
				message:
					'Hello Adventurer! I am the #rNewbie Guide#w, I can help you get started in the game. Most importantly is to learn the fundamentals of your class. Report to the Sage that corresponds to your class and then defeat the Battle Instructor applying what you have learnt.',
				options: [
					{
						text: '#GYeah sure#N',
						action: {
							type: 'npcSay',
							message: 'Use #yTAB#w to open the minimap to find your way.',
							onClose: [{ type: 'quest', add: 1001 }],
						},
					},
					{
						text: "#YNo, I'm not interested.#N",
						action: {
							type: 'npcSay',
							message: 'Maybe they were right about you.',
						},
					},
				],
			},
			{
				condition: {
					type: 'quest',
					quest: 1001,
					stage: 0,
				},
				type: 'npcSay',
				message:
					'Lost? Use #yTAB#w to open the minimap to find your way. Talk to the Sage of your race.',
			},
			{
				condition: {
					type: 'quest',
					quest: 1001,
					stage: 1,
				},
				type: 'npcSay',
				message: 'Did you challenge the Battle Instructor yet?',
			},
			{
				condition: {
					type: 'quest',
					quest: 1001,
					stage: 2,
				},
				type: 'array',
				actions: [
					{
						type: 'npcSay',
						message:
							'Congratulations on defeating the Battle Instructor#93#e You have earned a Pet Egg! Give the Pet Egg to the Pet Keeper to hatch your first pet!',
					},
					{ type: 'addItem', baseItemId: 60202 },
					{ type: 'quest', remove: 1001 },
					{ type: 'exp', amount: 1125 },
					{ type: 'quest', add: 1002 },
				],
			},
			{
				condition: {
					type: 'level',
					min: 3,
				},
				type: 'npcSay',
				message: 'Go ahead and talk to the Pet Keeper to learn more abouts pet aquisition.',
			},
			{
				condition: {
					type: 'level',
					min: 4,
				},
				type: 'npcSay',
				message: '',
			},
		],
	},
	{
		id: 0x80000098,
		name: 'Welcome Guide',
		file: 160,
		map: MapID.SkyPassage,
		point: { x: 3088, y: 1920 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message:
				"Welcome to #cff00ffMW Reborn!#w#eNew players should seek the #yNewbie Guide#w to learn more about the game and begin the newbie quest line.#e Alternatively, experienced adventures may wish to proceed directly to Woodlingor.#e Don't forget you can use #yTAB#w to open the minimap to find your way.",
		},
	},
	{
		id: 0x80000099,
		name: 'Snake Demon',
		file: 251,
		map: MapID.SkyPassage,
		point: { x: 3200, y: 2080 },
		direction: Direction.NorthWest,
		action: {
			type: 'npcSay',
			message:
				'The Snake Demon pet is mostly known for its potent magic damage. Hard to come by, but worth it!',
		},
	},
	{
		id: 0x80000100,
		name: 'Felsworn',
		file: 231,
		map: MapID.SkyPassage,
		point: { x: 3456, y: 1760 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				"Felsworn's fearsome reputation for speed makes it a valuable asset in battle. It's a bit hard to come by, but well worth it!",
		},
	},
	{
		id: 0x80000101,
		name: 'Tree Demon',
		file: 246,
		map: MapID.SkyPassage,
		point: { x: 3600, y: 1880 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				'Tree Demon can make for a great early game tank, easier to acquire than most pets.',
		},
	},
	{
		id: 0x80000102,
		name: 'Holy Dragon',
		file: 247,
		map: MapID.SkyPassage,
		point: { x: 528, y: 1736 },
		direction: Direction.SouthEast,
		action: {
			type: 'npcSay',
			message:
				'I am the #rHoly Dragon#w deity of #yStamina#w. My ability to withstand damage is second to none.',
		},
	},
	{
		id: 0x80000104,
		name: 'Centaur Sage',
		file: 14,
		map: MapID.SkyPassage,
		point: { x: 688, y: 1688 },
		direction: Direction.SouthEast,
		action: [
			{
				condition: {
					type: 'level',
					max: 1,
				},
				type: 'exp',
				amount: 1000,
			},
			{
				type: 'npcSay',
				message:
					'I am the #rCentaur Sage#w, I can teach you the basics of being a Centaur.#eWhat would you like to learn?',
				options: [
					{
						text: '#gTell me about the Centaur class.',
						action: {
							type: 'array',
							actions: [
								{
									type: 'npcSay',
									message:
										'A centuars main goal is to keep their allies alive. They can apply buffs to themselves and allies, as well as heal them. They also have an offensive magic attack that applies Physical Damage.',
								},
							],
						},
					},
					{
						text: '#gTell me about Centaur Stats.',
						action: {
							type: 'npcSay',
							message:
								"A Centaur's fastest growing stat is AGI, allowing them to heal and revive allies before their turn. STA is also important so they can withstand a barrage of attacks. The Multishot and Blizzard skills scale their damage from the INT stat.",
						},
					},
					{
						text: "#gI've heard enough.",
						action: {
							type: 'array',
							actions: [
								{
									type: 'npcSay',
									message:
										"Apply stat points from the Character Status window (#yAlt+W#w or left click the character avatar in the top left of the screen) and then I believe you're ready to challenge the Battle Instructor!",
								},
								{ type: 'quest', set: { quest: 1001, stage: 1 } },
							],
						},
					},
				],
			},
		],
	},
	{
		id: 0x80000105,
		name: 'Instructor',
		file: 121,
		map: MapID.SkyPassage,
		point: { x: 960, y: 360 },
		direction: Direction.SouthWest,
		action: [
			{
				type: 'npcSay',
				message:
					'Try talking to the Newbie Guide to get your first quest. You could also try talking to all of the race Sages to learn more about each race.',
			},
			{
				condition: {
					type: 'level',
					min: 3,
					inclusive: true,
				},
				type: 'npcSay',
				message:
					'Step through that portal to reach Woodlingor!#eI suggest asking the Love Angel or Brave Angel if they require assistance.',
			},
		],
	},
];
