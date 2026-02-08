import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const woodShopData: NpcJson[] = [
	{
		id: 0x80000135,
		name: 'Weaponsmith',
		file: 102,
		map: MapID.WoodlingorWeaponry,
		point: { x: 330, y: 298 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message:
				"Looking for a weapon? I can help you with that. Don't forget, an unprepared adventurer is a dead adventurer.",
			options: [
				{
					text: '#GYes I am.#e',
					action: {
						type: 'shop',
						items: [
							{ itemId: 420001, price: 50 },
							{ itemId: 421001, price: 100 },
							{ itemId: 420101, price: 150 },
							{ itemId: 421101, price: 200 },
							{ itemId: 420201, price: 250 },
							{ itemId: 421201, price: 300 },
							{ itemId: 420301, price: 350 },
							{ itemId: 421301, price: 401 },
						],
					},
				},
				{ text: "#gI'm not interested.#e" },
			],
		},
	},
	{
		id: 0x80000331,
		name: 'Healer',
		file: 103,
		map: MapID.WoodlingorHerbalShop,
		point: { x: 512, y: 288 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Make sure you have enough supplies before you leave.',
			options: [
				{
					text: '#gI need supplies.#e',
					action: {
						type: 'shop',
						items: [
							{ itemId: 10001, price: 50 },
							{ itemId: 10002, price: 100 },
							{ itemId: 10003, price: 150 },
							{ itemId: 10004, price: 200 },
							{ itemId: 10005, price: 250 },
							{ itemId: 10006, price: 300 },
							{ itemId: 10007, price: 350 },
							{ itemId: 10008, price: 401 },
							{ itemId: 10009, price: 450 },
							{ itemId: 10010, price: 500 },
							{ itemId: 10011, price: 550 },
							{ itemId: 10012, price: 600 },
							{ itemId: 10013, price: 650 },
							{ itemId: 10014, price: 700 },
							{ itemId: 10015, price: 750 },
							{ itemId: 10016, price: 800 },
							{ itemId: 10017, price: 850 },
							{ itemId: 10018, price: 900 },
							{ itemId: 10019, price: 950 },
							{ itemId: 10020, price: 1000 },
						],
					},
				},
				{ text: "#gI don't need anything.#e" },
			],
		},
	},
	{
		id: 0x80000332,
		name: 'Armorsmith',
		file: 102,
		map: MapID.WoodlingorArmory,
		point: { x: 330, y: 298 },
		direction: Direction.SouthWest,
		action: {
			type: 'npcSay',
			message: 'Need some protection? I have the finest armor in town.',
			options: [
				{
					text: '#GShow me what you have.#e',
					action: {
						type: 'shop',
						items: [
							// Human
							{ itemId: 400001, price: 50 },
							{ itemId: 410001, price: 100 },
							{ itemId: 430001, price: 50 },
							{ itemId: 401001, price: 50 },
							{ itemId: 411001, price: 100 },
							{ itemId: 431001, price: 50 },
							// Centaur
							{ itemId: 400101, price: 50 },
							{ itemId: 410101, price: 100 },
							{ itemId: 430101, price: 50 },
							{ itemId: 401101, price: 50 },
							{ itemId: 411101, price: 100 },
							{ itemId: 431101, price: 50 },
							// Mage
							{ itemId: 400201, price: 50 },
							{ itemId: 410201, price: 100 },
							{ itemId: 430201, price: 50 },
							{ itemId: 401201, price: 50 },
							{ itemId: 411201, price: 100 },
							{ itemId: 431201, price: 50 },
							// Borg
							{ itemId: 400301, price: 50 },
							{ itemId: 410301, price: 100 },
							{ itemId: 430301, price: 50 },
							{ itemId: 401301, price: 50 },
							{ itemId: 411301, price: 100 },
							{ itemId: 431301, price: 50 },
						],
					},
				},
				{ text: "#gI'm just looking.#e" },
			],
		},
	},
];
