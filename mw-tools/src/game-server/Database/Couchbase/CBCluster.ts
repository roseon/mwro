import type { QueryResult } from 'couchbase';
import { Cluster } from 'couchbase';
import type { IBucket } from '../Interfaces/IBucket';
import type { IBucketManager } from '../Interfaces/IBucketManager';
import type { ICluster } from '../Interfaces/ICluster';
import { CBBucket } from './CBBucket';
import { CBBucketManager } from './CBBucketManager';

export class CBCluster implements ICluster {
	private cluster: Promise<Cluster>;

	public constructor(host: string, username: string, password: string) {
		this.cluster = Cluster.connect('couchbase://' + host, { username, password });
	}

	public async bucket(name: string): Promise<IBucket> {
		return new CBBucket(await this.cluster, name);
	}

	public async buckets(): Promise<IBucketManager> {
		return new CBBucketManager(await this.cluster);
	}

	public async close(): Promise<void> {
		(await this.cluster).close();
	}

	public async createPrimaryIndex(
		bucket: string,
		scope: string,
		collection: string,
	): Promise<QueryResult> {
		let cluster = await this.cluster;

		if (
			!this.isValidDbName(bucket) ||
			!this.isValidDbName(scope) ||
			!this.isValidDbName(collection)
		)
			throw Error('Invalid names to create index on.');

		let query = `CREATE PRIMARY INDEX ON \`${bucket}\`.\`${scope}\`.\`${collection}\``;
		let res = await cluster.query(query, { adhoc: true });

		return res;
	}

	private isValidDbName(str: string): boolean {
		return /^[a-zA-Z0-9_]+$/.test(str);
	}
}
