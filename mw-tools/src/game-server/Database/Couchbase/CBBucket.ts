import type { Bucket, Cluster } from 'couchbase';
import type { IBucket } from '../Interfaces/IBucket';
import type { ICollection } from '../Interfaces/ICollection';
import type { ICollectionManager } from '../Interfaces/ICollectionManager';
import { CBCollection } from './CBCollection';
import { CBCollectionManager } from './CBCollectionManager';

export class CBBucket implements IBucket {
	private bucket: Bucket;

	public constructor(cluster: Cluster, name: string) {
		this.bucket = cluster.bucket(name);
	}

	public async collection(
		name: string,
		scope: string = '_default',
	): Promise<ICollection<unknown>> {
		return new CBCollection(this.bucket, name, scope);
	}

	public collections(): ICollectionManager {
		return new CBCollectionManager(this.bucket);
	}
}
