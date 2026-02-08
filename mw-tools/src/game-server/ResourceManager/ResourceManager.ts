import type { GetResourceType, TResourceKey } from '../Resources';

export interface IResourceLoader<TType = unknown> {
	load(): Promise<void>;
	get(): TType;
}

/**
 * Resource repository to hold a few static things that always need to
 * be loaded at the start of the server.
 */
class ResourceManagerClass {
	private readonly resources: Map<string, IResourceLoader> = new Map();
	private loaded: boolean = false;

	/**
	 * Load all added resources.
	 */
	public async load(): Promise<void> {
		if (this.loaded) throw Error('Resources already loaded.');

		this.loaded = true;
		await Promise.all([...this.resources].map(async ([, loader]) => loader.load()));
	}

	/**
	 * Add resource to the queue.
	 * @param key
	 * @param loader
	 */
	public add(key: string, loader: IResourceLoader): void {
		if (this.loaded) throw Error('Cannot add resource after the loading stage.');

		if (this.resources.has(key)) throw Error('Resource key ' + key + ' already in use.');

		this.resources.set(key, loader);
	}

	/**
	 * Retrieve a resource.
	 * @param key
	 */
	public get<T extends TResourceKey>(key: T): Readonly<GetResourceType<T>> {
		let loader = this.resources.get(key) as IResourceLoader<T>;

		if (!loader) throw Error('Resource key ' + key + ' does not exist.');

		return loader.get() as GetResourceType<T>;
	}
}

export const ResourceManager = new ResourceManagerClass();
