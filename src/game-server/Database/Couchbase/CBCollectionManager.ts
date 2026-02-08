import type { Bucket, CollectionManager } from 'couchbase';
import type { CollectionSpec, ICollectionManager } from '../Interfaces/ICollectionManager';

export class CBCollectionManager implements ICollectionManager {
	private collections: CollectionManager;

	public constructor(private bucket: Bucket) {
		this.collections = bucket.collections();
	}

	public async createCollection(settings: CollectionSpec): Promise<void> {
		await this.collections.createCollection({
			...settings,
			maxExpiry: 0,
		});
	}

	public async getAllCollections(): Promise<CollectionSpec[]> {
		// Getting a list of collections is not yet supported in the node sdk.
		// Use their internal http class to call the rest api.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let http = (this.collections as any)._http;

		if (!http || http.constructor.name !== 'HttpExecutor')
			throw Error('Couchbase.CollectionManager._http cannot be used');

		let res = await http.request({
			type: 'MGMT',
			method: 'GET',
			path: '/pools/default/buckets/' + this.bucket.name + '/collections',
			timeout: 0,
		});

		if (res.statusCode !== 200) throw Error(`Failed to get collections (${res.statusCode})`);

		let scopes = JSON.parse(res.body).scopes as {
			name: string;
			collections: { name: string }[];
		}[];
		let collections: CollectionSpec[] = [];

		scopes.forEach(scope =>
			scope.collections.forEach(col =>
				collections.push({
					name: col.name,
					scopeName: scope.name,
				}),
			),
		);

		return collections;
	}
}
