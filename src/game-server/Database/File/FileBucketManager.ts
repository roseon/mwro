import type { IBucketSettings } from 'couchbase';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import type { IBucketManager } from '../Interfaces/IBucketManager';
import type { FileCluster } from './FileCluster';

export class FileBucketManager implements IBucketManager {
	private readonly indexPath: string;
	private bucketCache: IBucketSettings[] | null = null;

	public constructor(private cluster: FileCluster) {
		this.indexPath = cluster.getPath() + '/buckets.json';
	}

	/**
	 * Get a list of all buckets.
	 */
	public async getAllBuckets(): Promise<IBucketSettings[]> {
		if (this.bucketCache === null) this.bucketCache = this.getAllBucketsFromFile();

		return this.bucketCache;
	}

	/**
	 * Create a bucket and save it.
	 * @param settings
	 */
	public async createBucket(settings: IBucketSettings): Promise<void> {
		let buckets = await this.getAllBuckets();

		if (buckets.some(b => b.name === settings.name))
			throw Error('Cannot create bucket, name already in use.');

		mkdirSync(this.cluster.getPath() + '/' + settings.name);
		buckets.push(settings);

		this.bucketCache = buckets;
		this.saveAllBucketsToFile(buckets);
	}

	/**
	 * Retrieve the list of buckets from the file system.
	 */
	private getAllBucketsFromFile(): IBucketSettings[] {
		if (!existsSync(this.indexPath)) return [];

		let contents = readFileSync(this.indexPath, { encoding: 'utf8' });
		let list = JSON.parse(contents);

		if (!list) list = [];

		return list;
	}

	/**
	 * Save buckets to the file system.
	 * @param buckets
	 */
	private saveAllBucketsToFile(buckets: IBucketSettings[]): void {
		writeFileSync(this.indexPath, JSON.stringify(buckets), { encoding: 'utf8' });
	}
}
