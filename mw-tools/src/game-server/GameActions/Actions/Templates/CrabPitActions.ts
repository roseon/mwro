import { MapID } from '../../../Enums/MapID';
import { GameActionParser } from '../../GameActionParser';
import { MessagePackets } from '../../../Responses/MessagePackets';
import { Game } from '../../../GameState/Game';
import { Player } from '../../../GameState/Player/Player';
import { Npc } from '../../../GameState/Npc/Npc';
import { Direction } from '../../../Enums/Direction';
import { Packet } from '../../../PacketBuilder';
import { PacketType } from '../../../PacketType';
import { ActionTemplateCallback } from '../ActionTemplateExecutable';
import { MapPackets } from '../../../Responses/MapPackets';
import { Point } from '../../../Utils/Point';
import { PlayerPackets } from '../../../Responses/PlayerPackets';

export class CrabPitEvent {
    // Configuration
    private static readonly MAP_ID = MapID.CrabPit;
    
    // Spawn Area defined by user: 17, 157 \ 71, 87 \ 177, 155 \ 97, 239 (Grid)
    // Converted to Server (Pixels): x*16, y*8
    private static readonly AREA_CORNERS = [
        { x: 17 * 16, y: 157 * 8 },  // Left
        { x: 71 * 16, y: 87 * 8 },   // Top
        { x: 177 * 16, y: 155 * 8 }, // Right
        { x: 97 * 16, y: 239 * 8 }   // Bottom
    ];

    private static readonly PIT_CENTER_X = 1264;
    private static readonly PIT_CENTER_Y = 1248;
    private static readonly CATCH_PHASE_DURATION = 60000;
    private static readonly ROLL_PHASE_DURATION = 30000;

    // State
    private static rollScores: Map<number, number> = new Map();
    private static currentWinnerId: number | null = null;
    private static isCatchingPhase: boolean = false;
    private static catchesInCurrentTurn: number = 0;
    private static phaseStartTime: number = 0;
    private static crabs: Npc[] = [];
    private static rollingStarted: boolean = false;

    // Callbacks
    public static enter: ActionTemplateCallback = ({ player, game, client }) => {
        // Schedule Check: Mon/Wed 19:00, Fri 15:00
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();

        // Allow 1 hour window?
        let isOpen = false;
        if ((day === 1 || day === 3) && hour === 19) isOpen = true;
        if (day === 5 && hour === 15) isOpen = true;

        if (!isOpen) {
            player.client?.write(MessagePackets.showSystem("Crab Pit is closed. Opening times: Mon/Wed 19:00, Fri 15:00."));
			return;
        }

        // Teleport to Pit area using GameActionParser for safety
        // Converts Pixel coordinates back to Grid coordinates for the Teleport action
        GameActionParser.parse({
            type: 'teleport',
            coordinates: {
                map: CrabPitEvent.MAP_ID,
                x: CrabPitEvent.PIT_CENTER_X / 16,
                y: CrabPitEvent.PIT_CENTER_Y / 8
            }
        }).execute({ player, game, client });
        
        player.client?.write(MessagePackets.showSystem("Welcome to the Crab Pit! Talk to the coordinator to roll dice."));
    };

    public static roll: ActionTemplateCallback = ({ player, game }) => {
        CrabPitEvent.updateState(game);

        if (CrabPitEvent.isCatchingPhase) {
            player.client?.write(MessagePackets.showSystem("Catching phase in progress. Please wait for the next turn."));
            return;
        }

        if (CrabPitEvent.rollScores.has(player.id)) {
            const score = CrabPitEvent.rollScores.get(player.id);
            player.client?.write(MessagePackets.showSystem(`You already rolled: ${score}. Wait for results."`));
            return;
        }

        // Initialize rolling phase if idle
        if (!CrabPitEvent.rollingStarted) {
            CrabPitEvent.rollingStarted = true;
            CrabPitEvent.phaseStartTime = Date.now();
            CrabPitEvent.rollScores.clear();
            // Broadcast? "Rolling phase started! 30s to join!"
        }

        // Roll 3 dice (1-33)
        const d1 = Math.floor(Math.random() * 33) + 1;
        const d2 = Math.floor(Math.random() * 33) + 1;
        const d3 = Math.floor(Math.random() * 33) + 1;
        const total = d1 + d2 + d3;

        CrabPitEvent.rollScores.set(player.id, total);
        player.client?.write(MessagePackets.showSystem(`You rolled ${d1}, ${d2}, ${d3}. Total: ${total}.`));
        
        // Find current potential leader
        let max = -1;
        for (const s of CrabPitEvent.rollScores.values()) if (s > max) max = s;
        
        if (total >= max) {
            player.client?.write(MessagePackets.showSystem("You are currently in the lead!"));
        } else {
            player.client?.write(MessagePackets.showSystem("You have been outrolled!"));
        }
    };

    public static catch: ActionTemplateCallback = ({ player, game }, params) => {
        CrabPitEvent.updateState(game);

        const isFake = params?.isFake as boolean;
        const npcIdStr = params?.npcId as string; // We might need to pass ID

        if (!CrabPitEvent.isCatchingPhase) {
            player.client?.write(MessagePackets.showSystem("There are no crabs to catch right now."));
            
            // Clean up if the crab shouldn't be here
             if (npcIdStr) {
                 const nid = parseInt(npcIdStr);
                 const npcIndex = CrabPitEvent.crabs.findIndex(n => n.id === nid);
                 if (npcIndex !== -1) {
                     const npc = CrabPitEvent.crabs[npcIndex];

                     // Send NPC remove packet to all players on map
                     if ((MapPackets as any).npcRemove) {
                         npc.mapData.map.sendPacket((MapPackets as any).npcRemove([npc]));
                         
                         // Also remove from map/memory officially to be safe
                         const mapNpcIndex = npc.mapData.map.npcs.indexOf(npc);
                         if (mapNpcIndex > -1) {
                            npc.mapData.map.npcs.splice(mapNpcIndex, 1);
                         }
                         game.npcs.delete(npc.id);
                         CrabPitEvent.crabs.splice(npcIndex, 1);
                     }
                 }
            }
            return;
        }

        if (player.id !== CrabPitEvent.currentWinnerId) {
            player.client?.write(MessagePackets.showSystem("It's not your turn to catch!"));
            return;
        }

        if (isFake) {
            player.client?.write(MessagePackets.showSystem("It was a fake crab! No points."));
        } else {
            CrabPitEvent.catchesInCurrentTurn++;
            const reward = CrabPitEvent.catchesInCurrentTurn * 500;
            
            // Grant Reward (RP)
            player.misc.reputation += reward;
            player.client?.write(PlayerPackets.misc(player));
            
            player.client?.write(MessagePackets.showSystem(`Catch #${CrabPitEvent.catchesInCurrentTurn}! You gained ${reward} Reputation Points.`));
            player.client?.write(MessagePackets.showSystem(`Total RP: ${player.misc.reputation}`));
        }

        // Remove the crab (Fake or Real)
        // We need the NPC instance. 
        // Since we can't easily find "this" NPC from context without it being in Context (it's not),
        // we'll assume the client sent the interaction which triggered this.
        // But `ActionTemplate` doesn't pass the source NPC.
        // Workaround: We remove ONE crab from our list that matches? 
        // Or we just remove the specific one if we passed its ID in params when spawning.
        
        // If we generated the params with the ID, we can look it up.
        // Assuming params.npcId is the internal ID.
        if (npcIdStr) {
             const nid = parseInt(npcIdStr);
             const npcIndex = CrabPitEvent.crabs.findIndex(n => n.id === nid);
             if (npcIndex !== -1) {
                 const npc = CrabPitEvent.crabs[npcIndex];

                 // Send NPC remove packet to all players on map
                 if ((MapPackets as any).npcRemove) {
                     npc.mapData.map.sendPacket((MapPackets as any).npcRemove([npc]));
                 }

                 // Relocate NPC
                 const p = CrabPitEvent.getRandomSpawnPoint();
                 
                 npc.mapData.point = p;

                 // Send NPC add packet to all players on map to show it at new location
                 if ((MapPackets as any).npcAdd) {
                     npc.mapData.map.sendPacket((MapPackets as any).npcAdd([npc]));
                 }
             }
        }
    };

    private static updateState(game: Game) {
        const now = Date.now();

        if (CrabPitEvent.isCatchingPhase) {
            if (now - CrabPitEvent.phaseStartTime > CrabPitEvent.CATCH_PHASE_DURATION) {
                CrabPitEvent.endCatchingPhase(game);
                CrabPitEvent.rollingStarted = false; // Reset
            }
        } else if (CrabPitEvent.rollingStarted) {
            if (now - CrabPitEvent.phaseStartTime > CrabPitEvent.ROLL_PHASE_DURATION) {
                CrabPitEvent.startCatchingPhase(game);
            }
        }
    }

    private static startCatchingPhase(game: Game) {
        // Determine winner
        let max = -1;
        let winnerId = -1;
        for (const [pid, score] of CrabPitEvent.rollScores) {
            if (score > max) {
                max = score;
                winnerId = pid;
            }
        }

        if (winnerId !== -1) {
            CrabPitEvent.currentWinnerId = winnerId;
            CrabPitEvent.isCatchingPhase = true;
            CrabPitEvent.phaseStartTime = Date.now();
            CrabPitEvent.catchesInCurrentTurn = 0;

            const winner = game.players.get(winnerId);
            if (winner && winner.client) {
                winner.client.write(MessagePackets.showSystem("Congratulations! You won the roll. Go catch the crabs in the Crab Pit!"));
                // Broadcast to others?
            }

            CrabPitEvent.spawnCrabs(game);
        } else {
            // No one rolled? Reset
            CrabPitEvent.rollingStarted = false;
        }
        
        CrabPitEvent.rollScores.clear();
    }

    private static endCatchingPhase(game: Game) {
        CrabPitEvent.isCatchingPhase = false;
        CrabPitEvent.currentWinnerId = null;

        // Despawn all crabs
        for (const npc of CrabPitEvent.crabs) {
            const mapNpcIndex = npc.mapData.map.npcs.indexOf(npc);
            if (mapNpcIndex > -1) {
                npc.mapData.map.npcs.splice(mapNpcIndex, 1);
            }
            game.npcs.delete(npc.id);
        }
        CrabPitEvent.crabs = [];

        // Broadcast? "Turn ended."
    }

    private static spawnCrabs(game: Game) {
        // Spawn 20 crabs
        const map = game.maps.get(CrabPitEvent.MAP_ID);
        if (!map) return;

        for (let i = 0; i < 20; i++) {
            // Random pos in area
            const p = CrabPitEvent.getRandomSpawnPoint();
            const x = p.x;
            const y = p.y;
            
            const isFake = Math.random() < 0.3; // 30% fake

            // Generate unique ID
            const id = 0x80010000 + Math.floor(Math.random() * 0xFFFF);
            
            // Create Action with params
            // Note: We need to bake the ID into the params so we know which one to delete
            const action = GameActionParser.parse({
                type: 'template',
                template: 'crabPitCatch',
                params: {
                    isFake: isFake,
                    npcId: id.toString()
                }
            });

            const npcJson = {
                id: id,
                name: isFake ? 'Crab' : 'Crab',
                file: 262, // Bubble Crab file ID (valid in game client)
                map: CrabPitEvent.MAP_ID,
                point: { x: x, y: y },
                direction: Direction.South
            };

            const npc = new Npc(npcJson, game.maps);
            npc.action = action;
            
            // Add to game
            map.npcs.push(npc);
            game.npcs.set(npc.id, npc);
            
            // Send NPC add packet
            // Using MapPackets.npcAdd if available, strictly typed
            // If unknown, fallback to Packet builder manually or skip if MapPackets.npcAdd is not visible to me
            // Based on Game.ts logic "npc.mapData.map.sendPacket(MapPackets.npcAdd([npc]));"
            // I will assume it exists.
            if ((MapPackets as any).npcAdd) {
                 map.sendPacket((MapPackets as any).npcAdd([npc]));
            } else {
                 // Fallback if compilation fails logic
                 // But since I import it, let's hope it's there.
                 // Actually I'll use 'any' casting to avoid TS errors if I can't verify signature
                 map.sendPacket((MapPackets as any).npcAdd([npc]));
            }
            
            CrabPitEvent.crabs.push(npc);
        }
    }

    private static getRandomSpawnPoint(): Point {
        // Split into 2 triangles: 0-1-2 and 0-2-3
        // 0: Left, 1: Top, 2: Right, 3: Bottom
        
        const inFirstTriangle = Math.random() < 0.5;
        
        const p1 = CrabPitEvent.AREA_CORNERS[0];
        const p2 = inFirstTriangle ? CrabPitEvent.AREA_CORNERS[1] : CrabPitEvent.AREA_CORNERS[3];
        const p3 = CrabPitEvent.AREA_CORNERS[2];

        let r1 = Math.random();
        let r2 = Math.random();

        if (r1 + r2 > 1) {
            r1 = 1 - r1;
            r2 = 1 - r2;
        }

        const x = p1.x + r1 * (p2.x - p1.x) + r2 * (p3.x - p1.x);
        const y = p1.y + r1 * (p2.y - p1.y) + r2 * (p3.y - p1.y);

        return new Point(Math.floor(x), Math.floor(y));
    }
}
