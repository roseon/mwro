
import { MapID } from '../../../Enums/MapID';
import { GameActionParser } from '../../GameActionParser';
import { ActionTemplateCallback } from '../ActionTemplateExecutable';
import { MessagePackets } from '../../../Responses/MessagePackets';
import { Game } from '../../../GameState/Game';

export class MapTester {
    private static maps: { name: string; id: number }[] = [];

    private static initializeMaps() {
        if (this.maps.length > 0) return;
        
        // Iterate MapID enum
        for (const key in MapID) {
            if (isNaN(Number(key))) {
                const id = MapID[key as keyof typeof MapID];
                this.maps.push({ name: key, id: id });
            }
        }
        // Sort by ID
        this.maps.sort((a, b) => a.id - b.id);
    }

    public static menu: ActionTemplateCallback = ({ player, game, client }, params) => {
        MapTester.initializeMaps();

        const page = typeof params?.page === 'number' ? params.page : 0;
        const pageSize = 5;
        const totalPages = Math.ceil(MapTester.maps.length / pageSize);
        const startIndex = page * pageSize;
        const endIndex = Math.min(startIndex + pageSize, MapTester.maps.length);
        const currentMaps = MapTester.maps.slice(startIndex, endIndex);

        const options = [];

        for (const map of currentMaps) {
            options.push({
                text: `#g${map.name} (${map.id})#e`,
                action: {
                    type: 'teleport',
                    coordinates: {
                        map: map.id,
                        x: 100, // Default safe-ish coordinate?
                        y: 100 
                    }
                }
            });
        }

        // Navigation
        if (page > 0) {
            options.push({
                text: '#yPrevious Page#e',
                action: {
                    type: 'template',
                    template: 'mapTester',
                    params: { page: page - 1 }
                }
            });
        }

        if (page < totalPages - 1) {
            options.push({
                text: '#yNext Page#e',
                action: {
                    type: 'template',
                    template: 'mapTester',
                    params: { page: page + 1 }
                }
            });
        }

        options.push({ text: 'Close' });

        // Force the NPC dialog presentation manually or via Action Parser?
        // Since we are inside a callback, we usually execute actions.
        // But `npcSay` with options is an action type.
        // We can use GameActionParser to execute an `npcSay` action with these options.
        
        GameActionParser.parse({
            type: 'npcSay',
            message: `Select a map to teleport to (Page ${page + 1}/${totalPages}):`,
            options: options
        } as any).execute({ player, game, client });
    };
}
