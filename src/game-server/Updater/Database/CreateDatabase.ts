import type { ICreateBucketSettings } from 'couchbase';
import { IndexExistsError } from 'couchbase';
import { CBCluster } from '../../Database/Couchbase/CBCluster';
import { Database } from '../../Database/Database';
import type { IBucket } from '../../Database/Interfaces/IBucket';
import type { CollectionSpec } from '../../Database/Interfaces/ICollectionManager';
import { Logger } from '../../Logger/Logger';
import { bucketSettings } from './Buckets';
import { collectionSettings } from './Collections';

/**
 * Create all buckets.
 */
export async function createBuckets(): Promise<Promise<void>[]> {
	let cluster = Database.get().cluster;
	let buckets = await cluster.buckets();
	let existingBuckets = await buckets.getAllBuckets();
	let createSettings: ICreateBucketSettings[] = [];

	bucketSettings.forEach(s =>
		existingBuckets.some(b => b.name === s.name)
			? Logger.info(`Skipping the creation of bucket ${s.name}: bucket already exists.`)
			: createSettings.push(s),
	);

	let promises = createSettings.map(async settings => buckets.createBucket(settings));

	return promises;
}

/**
 * Create all collections.
 */
export async function createCollections(): Promise<Promise<void>[]> {
	let cluster = Database.get().cluster;
	let promises: Promise<void>[] = [];

	await Promise.all(
		Object.entries(collectionSettings).map(async ([bucketName, settingsArr]) => {
			let bucket = await cluster.bucket(bucketName);
			let createPromises = await createCollectionsInBucket(bucket, settingsArr);
			promises.push(...createPromises);
		}),
	);

	return promises;
}

/**
 * Create the given collections in the given bucket if they don't exist yet.
 * @param bucket
 * @param collections
 */
async function createCollectionsInBucket(
	bucket: IBucket,
	collections: CollectionSpec[],
): Promise<Promise<void>[]> {
	let cols = bucket.collections();
	let existingCols = await cols.getAllCollections();
	let createSettings: CollectionSpec[] = [];

	collections.forEach(s =>
		existingCols.some(c => c.name === s.name)
			? Logger.info(
					`Skipping the creation of collection ${s.name}: collection already exists.`,
			  )
			: createSettings.push(s),
	);

	return createSettings.map(async settings => cols.createCollection(settings));
}

/**
 * Create all indexes.
 */
export async function createIndexes(): Promise<Promise<void>[]> {
	let acluster = Database.get().cluster;
	if (!(acluster instanceof CBCluster)) return [];

	let cluster: CBCluster = acluster;
	let promises: Promise<void>[] = [];

	await Promise.all(
		Object.entries(collectionSettings).map(async ([bucketName, settingsArr]) =>
			promises.push(
				...settingsArr
					.filter(col => col.primaryIndex)
					.map(async col => {
						try {
							await cluster.createPrimaryIndex(bucketName, col.scopeName, col.name);
						} catch (e: unknown) {
							if (!(e instanceof IndexExistsError)) throw e;
						}
					}),
			),
		),
	);

	return promises;
}
