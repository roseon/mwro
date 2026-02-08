import { JsonLoader } from './ResourceManager/Loaders/JsonLoader';
import { MapCellLoader } from './ResourceManager/Loaders/MapCellLoader';
import type { IResourceLoader } from './ResourceManager/ResourceManager';
import { ResourceManager } from './ResourceManager/ResourceManager';

// The path to game-server
const baseDir = module.path;

let resources = {
	config: new JsonLoader(baseDir + '/server.config.json'),
	mapData: new JsonLoader(baseDir + '/../../output/map/mapData.json'),
	mapCells: new MapCellLoader(baseDir + '/../../output/map/cells'),
};

type TResources = typeof resources;
export type TResourceKey = keyof TResources;
export type GetResourceType<T extends TResourceKey> = TResources[T] extends IResourceLoader<infer R>
	? R
	: never;

export function addAllResources(): void {
	addResources(Object.keys(resources) as TResourceKey[]);
}

export function addResources(keys: TResourceKey[]): void {
	keys.forEach(key => ResourceManager.add(key, resources[key]));
}
