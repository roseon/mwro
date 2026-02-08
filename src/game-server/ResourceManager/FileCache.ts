import { open, readFile, readdir } from 'fs/promises';
import { normalize } from 'path';

export type FileCacheEntry = {
	path: string;
	buffer: Buffer;
	shared: SharedArrayBuffer | null;
};

/**
 * Used for keeping static files permanently in memory.
 */
class FileCacheClass {
	private readonly files: Map<string, FileCacheEntry> = new Map();

	/**
	 * Get a file from the cache.
	 * @throws when the path does not exist in the cache.
	 * @param path
	 */
	public getFile(path: string): FileCacheEntry {
		path = normalize(path);
		let entry = this.files.get(path);

		if (!entry) throw Error(`Path ${path} not found in cache.`);

		return entry;
	}

	/**
	 * Returns all files in the cache under this directory.
	 * @param path
	 */
	public getDirectory(path: string): FileCacheEntry[] {
		path = normalize(path + '/');

		return [...this.files.values()].filter(entry => entry.path.startsWith(path));
	}

	/**
	 * Adds a file to the cache.
	 * @param path
	 * @param shared use a SharedArrayBuffer
	 * @returns the path it is stored as
	 */
	public async cacheFile(path: string, shared: boolean = false): Promise<string> {
		path = normalize(path);
		let data = shared ? await this.loadSharedFile(path) : await this.loadFile(path);
		this.files.set(path, data);

		return path;
	}

	/**
	 * Adds all files in this path to the cache.
	 * Ignores subdirectories.
	 * @param path
	 * @param shared use SharedArrayBuffers
	 * @returns the normalised directory path
	 */
	public async cacheDirectory(path: string, shared: boolean = false): Promise<string> {
		path = normalize(path);
		let files = await readdir(path, { withFileTypes: true });

		await Promise.all(
			files
				.filter(file => file.isFile())
				.map(async file => this.cacheFile(path + '/' + file.name, shared)),
		);

		return path;
	}

	/**
	 * Read a file into a buffer.
	 * @param path
	 */
	private async loadFile(path: string): Promise<FileCacheEntry> {
		return { path, buffer: await readFile(path), shared: null };
	}

	/**
	 * Read a file into a buffer wrapped around a SharedArrayBuffer.
	 * @param path
	 */
	private async loadSharedFile(path: string): Promise<FileCacheEntry> {
		let fh = await open(path, 'r');
		let stat = await fh.stat();
		let shared = new SharedArrayBuffer(stat.size);
		let buffer = Buffer.from(shared);
		await fh.read(buffer, 0, stat.size, 0);
		await fh.close();
		return { path, buffer, shared };
	}
}

export const FileCache = new FileCacheClass();
