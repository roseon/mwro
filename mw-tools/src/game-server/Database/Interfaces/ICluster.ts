import type { IBucket } from './IBucket';
import type { IBucketManager } from './IBucketManager';

export interface ICluster {
	/**
	 * Open a new bucket.
	 * @param name
	 */
	bucket(name: string): Promise<IBucket>;

	/**
	 * Get the bucket manager.
	 */
	buckets(): Promise<IBucketManager>;

	/**
	 * Close a connection if necessary.
	 */
	close(): Promise<void>;
}
