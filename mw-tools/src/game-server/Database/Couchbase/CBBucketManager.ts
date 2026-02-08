import type { BucketManager, BucketSettings, Cluster, ICreateBucketSettings } from 'couchbase';
import type { IBucketManager } from '../Interfaces/IBucketManager';

export class CBBucketManager implements IBucketManager {
	private buckets: BucketManager;

	public constructor(cluster: Cluster) {
		this.buckets = cluster.buckets();
	}

	public async getAllBuckets(): Promise<BucketSettings[]> {
		return this.buckets.getAllBuckets();
	}

	public async createBucket(settings: ICreateBucketSettings): Promise<void> {
		await this.buckets.createBucket(settings);
	}
}
