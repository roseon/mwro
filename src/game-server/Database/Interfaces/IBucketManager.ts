import type { IBucketSettings } from 'couchbase';

export interface IBucketManager {
	/**
	 * Get list of buckets.
	 */
	getAllBuckets(): Promise<IBucketSettings[]>;

	/**
	 * Create a new bucket.
	 * @param settings
	 */
	createBucket(settings: IBucketSettings): Promise<void>;
}
