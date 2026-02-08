import type { BaseItemJson } from '../../Database/Collections/BaseItem/BaseItemTypes';
import { MapID } from '../../Enums/MapID';
import { ItemType } from '../../GameState/Item/ItemType';

export const teleportItemData: BaseItemJson[] = [
	{
		id: 11000,
		file: 46,
		name: 'Sanctuary Wing',
		description: 'Return to Woodlingor.#eSolo use only.#ePersists after use.',
		type: ItemType.Usable,
		stackLimit: 1,
		action: {
			type: 'teleport',
			coordinates: {
				map: MapID.Woodlingor,
				x: 480,
				y: 245,
			},
		},
	},
	{
		id: 11001,
		file: 315,
		name: 'Town Scroll',
		description:
			'Teleport to a town of your choosing. #eCan be used in Party.#eConsumed upon use.',
		type: ItemType.Usable,
		stackLimit: 1,
		action: {
			type: 'array',
			actions: [
				{
					type: `npcSay`,
					message: `You're using a #rTown Scroll#w select where you'd like to go.`,
					options: [
						{
							text: `#gWoodlingor`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.Woodlingor,
										x: 480,
										y: 245,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11001,
								},
							],
						},
						{
							text: `#gBlython`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.Blython,
										x: 100,
										y: 650,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11001,
								},
							],
						},
						{
							text: `#gDesert City`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.DesertCity,
										x: 305,
										y: 450,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11001,
								},
							],
						},
						{
							text: `#gDemon Square`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.DemonSquare,
										x: 295,
										y: 320,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11001,
								},
							],
						},
						{
							text: `#rI changed my mind.`,
						},
					],
				},
			],
		},
	},
	{
		id: 11002,
		file: 316,
		name: 'Dungeon Scroll',
		description:
			'Teleport to a dungeon of your choosing. #eCan be used in Party.#eConsumed upon use.',
		type: ItemType.Usable,
		stackLimit: 1,
		action: {
			type: 'array',
			actions: [
				{
					type: `npcSay`,
					message: `You're using a #rDungeon Scroll#w select where you'd like to go.`,
					options: [
						{
							text: `#gDemon Lair 3`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.DemonLair3,
										x: 50,
										y: 70,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11002,
								},
							],
						},
						{
							text: `#gEvil Lair 3`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.EvilLair3,
										x: 50,
										y: 70,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11002,
								},
							],
						},
						{
							text: `#gAsh Pit 2`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.AshesPits2,
										x: 175,
										y: 295,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11002,
								},
							],
						},
						{
							text: `#gBurial 4`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.Burial4,
										x: 36,
										y: 42,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11002,
								},
							],
						},
						{
							text: `#rI changed my mind.`,
						},
					],
				},
			],
		},
	},
	{
		id: 11003,
		file: 314,
		name: 'Desolate Scroll',
		description:
			'Teleport to a desolate region of your choosing. #eCan be used in Party.#eConsumed upon use.',
		type: ItemType.Usable,
		stackLimit: 1,
		action: {
			type: 'array',
			actions: [
				{
					type: `npcSay`,
					message: `You're using a #rDesolate Scroll#w select where you'd like to go.`,
					options: [
						{
							text: `#gOutcast City`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.OutcastCity,
										x: 40,
										y: 140,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11003,
								},
							],
						},
						{
							text: `#gBone Desert`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.BoneDesert,
										x: 195,
										y: 285,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11003,
								},
							],
						},
						{
							text: `#gBadlands`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.Badlands,
										x: 305,
										y: 135,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11003,
								},
							],
						},
						{
							text: `#gFlamingor`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.Flamingor,
										x: 55,
										y: 460,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11003,
								},
							],
						},
						{
							text: `#rI changed my mind.`,
						},
					],
				},
			],
		},
	},
	{
		id: 11004,
		file: 47,
		name: 'Wasteland Scroll',
		description:
			'Teleport to a wasteland region of your choosing. #eCan be used in Party.#eConsumed upon use.',
		type: ItemType.Usable,
		stackLimit: 1,
		action: {
			type: 'array',
			actions: [
				{
					type: `npcSay`,
					message: `You're using a #rWasteland Scroll#w select where you'd like to go.`,
					options: [
						{
							text: `#gDevils Gate`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.DevilsGate,
										x: 155,
										y: 195,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11004,
								},
							],
						},
						{
							text: `#gFlame Ruins`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.FlameRuins,
										x: 140,
										y: 55,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11004,
								},
							],
						},
						{
							text: `#gCursed Abyss`,
							action: [
								{
									type: `teleport`,
									coordinates: {
										map: MapID.CursedAbyss,
										x: 356,
										y: 438,
									},
								},
								{
									type: `removeItem`,
									baseItemId: 11004,
								},
							],
						},
						{
							text: `#rI changed my mind.`,
						},
					],
				},
			],
		},
	},
	{
		id: 11005,
		file: 45,
		name: 'Scroll of Return',
		description: 'Bind to a location and use to return.#eSolo use only.#eConsumed upon use.',
		type: ItemType.Usable,
		stackLimit: 1,
		action: [
			{
				condition: [
					{
						type: 'itemProp',
						itemProperties: {}, // Check if any properties exist
					},
				],
				type: 'array',
				actions: [
					{
						type: 'teleport',
						useStoredLocation: true, // Use the stored location from item properties
					},
					{
						type: 'removeLastItemUsed',
					},
				],
			},
			{
				condition: [
					{
						type: 'itemProp',
						itemProperties: {}, // Check if any properties exist
						not: true,
					},
				],
				// This runs if no properties exist yet (first use)
				type: 'addItemProps',
				properties: {
					bindLocation: {},
				},
			},
		],
	},
];
