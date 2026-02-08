import type { FileCacheEntry } from '../FileCache';
import { FileCache } from '../FileCache';
import type { IResourceLoader } from '../ResourceManager';

/**
 * Resource loader for a specific file.
 */
export class FileLoader implements IResourceLoader<FileCacheEntry> {
	public constructor(private path: string, private shared: boolean = false) {}

	public async load(): Promise<void> {
		this.path = await FileCache.cacheFile(this.path, this.shared);
	}

	public get(): FileCacheEntry {
		return FileCache.getFile(this.path);
	}
}
