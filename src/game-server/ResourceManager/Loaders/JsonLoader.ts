import type { IResourceLoader } from '../ResourceManager';
import { FileLoader } from './FileLoader';

/**
 * Resource loader for a json file.
 */
export class JsonLoader implements IResourceLoader {
	private json: unknown;

	public constructor(private path: string) {}

	public async load(): Promise<void> {
		let fileLoader = new FileLoader(this.path);
		await fileLoader.load();

		this.json = JSON.parse(fileLoader.get().buffer.toString('utf8'));
	}

	public get(): unknown {
		return this.json;
	}
}
