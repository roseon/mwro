import type { FileCacheEntry } from '../FileCache';
import { FileCache } from '../FileCache';
import type { IResourceLoader } from '../ResourceManager';

/**
 * Resource loader for all files in a directory.
 */
export class DirectoryLoader implements IResourceLoader<FileCacheEntry[]> {
	public constructor(private path: string, private shared: boolean = false) {}

	public async load(): Promise<void> {
		this.path = await FileCache.cacheDirectory(this.path, this.shared);
	}

	public get(): FileCacheEntry[] {
		return FileCache.getDirectory(this.path);
	}
}
