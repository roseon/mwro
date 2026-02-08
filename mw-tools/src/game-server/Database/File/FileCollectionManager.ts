import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import type { CollectionSpec, ICollectionManager } from '../Interfaces/ICollectionManager';
import type { FileBucket } from './FileBucket';

export class FileCollectionManager implements ICollectionManager {
	private readonly indexPath: string;
	private collectionCache: CollectionSpec[] | null = null;

	public constructor(private bucket: FileBucket) {
		this.indexPath = bucket.getPath() + '/collections.json';
	}

	/**
	 * Get a list of all collections.
	 */
	public async getAllCollections(): Promise<CollectionSpec[]> {
		if (this.collectionCache === null) this.collectionCache = this.getAllCollectionsFromFile();

		return this.collectionCache;
	}

	/**
	 * Create a collection and save it.
	 * @param settings
	 */
	public async createCollection(settings: CollectionSpec): Promise<void> {
		let collections = await this.getAllCollections();

		if (collections.some(c => c.name === settings.name && c.scopeName === settings.scopeName))
			throw Error('Cannot create collection, name already in use.');

		mkdirSync(this.bucket.getPath() + '/' + settings.scopeName + '/' + settings.name, {
			recursive: true,
		});
		collections.push(settings);

		this.collectionCache = collections;
		this.saveAllCollectionsToFile(collections);
	}

	/**
	 * Retrieve the list of collections from the file system.
	 */
	private getAllCollectionsFromFile(): CollectionSpec[] {
		if (!existsSync(this.indexPath)) return [];

		let contents = readFileSync(this.indexPath, { encoding: 'utf8' });
		let list = JSON.parse(contents);

		if (!list) list = [];

		return list;
	}

	/**
	 * Save collections to the file system.
	 * @param collections
	 */
	private saveAllCollectionsToFile(collections: CollectionSpec[]): void {
		writeFileSync(this.indexPath, JSON.stringify(collections), { encoding: 'utf8' });
	}
}
