import type { NpcJson } from '../../../Database/Collections/Npc/NpcJson';
import { Direction } from '../../../Enums/Direction';
import { MapID } from '../../../Enums/MapID';

export const CrabPitNpcsData: NpcJson[] = [
    {
        id: 0x80009910,
        name: 'Crab Pit Coordinator',
        file: 112,
        map: MapID.CrabPit,
        point: { x: 38 * 16, y: 176 * 8 },
        direction: Direction.South,
        action: {
            type: 'npcSay',
            message: 'Ready to roll the dice?',
            options: [
                {
                    text: 'Roll Dice',
                    action: {
                        type: 'template',
                        template: 'crabPitRoll'
                    }
                },
                {
                    text: 'Close'
                }
            ]
        }
    },
    {
        id: 0x80009911,
        name: 'Crab Pit npc',
        file: 111,
        map: MapID.CrabPit,
        point: { x: 49 * 16, y: 191 * 8 },
        direction: Direction.South,
        action: {
            type: 'npcSay',
            message: 'Do you want to leave the Crab Pit?',
            options: [
                {
                    text: 'Yes, get me out of here.',
                    action: {
                        type: 'teleport',
                        coordinates: {
                            map: MapID.Woodlingor,
                            x: 460, // 7360 / 16: Teleport to "Crab Pit" entrance NPC
                            y: 555  // 4440 / 8
                        }
                    }
                },
                {
                    text: 'No, I want to stay.'
                }
            ]
        }
    },
    {
        id: 0x80009912,
        name: 'Crab Merchant',
        file: 262, // Crab sprite
        map: MapID.CrabPit,
        point: { x: 29 * 16, y: 170 * 8 },
        direction: Direction.South,
        action: {
            type: 'npcSay',
            message: 'Got some shiny stones / eggs?',
            options: [
                {
                    text: 'Trade',
                    action: {
                        type: 'template',
                        template: 'testShop', // Uses the generic shop template logic
                        params: { shopName: 'crabPitShop' }
                    }
                },
                {
                    text: 'No thanks'
                }
            ]
        }
    }
];
