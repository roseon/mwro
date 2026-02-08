import { parse } from 'path';
import type { IResourceLoader } from '../ResourceManager';
import { DirectoryLoader } from './DirectoryLoader';

type MapCellLoaderEntry = { map: number; buffer: Buffer; shared: SharedArrayBuffer };

/**
 * Resource loader for the map cell data.
 */
export class MapCellLoader implements IResourceLoader<MapCellLoaderEntry[]> {
	private data: MapCellLoaderEntry[] | null = null;

	public constructor(private path: string) {}

	public async load(): Promise<void> {
		let dirLoader = new DirectoryLoader(this.path, true);
		await dirLoader.load();
		this.data = dirLoader.get().map(entry => ({
			map: this.getMapNumber(entry.path),
			buffer: entry.buffer,
			shared: entry.shared!,
		}));
	}

	public get(): MapCellLoaderEntry[] {
		if (this.data === null) throw Error('Map cells not loaded.');

		return this.data;
	}

	private getMapNumber(path: string): number {
		return parseInt(parse(path).name);
	}
}
