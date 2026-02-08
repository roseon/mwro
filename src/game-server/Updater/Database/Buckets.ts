import type { ICreateBucketSettings } from 'couchbase';
import {
	BucketType,
	CompressionMode,
	ConflictResolutionType,
	DurabilityLevel,
	EvictionPolicy,
	StorageBackend,
} from 'couchbase';

export const bucketSettings: ICreateBucketSettings[] = [
	{
		bucketType: BucketType.Couchbase,
		conflictResolutionType: ConflictResolutionType.SequenceNumber,
		evictionPolicy: EvictionPolicy.ValueOnly,
		flushEnabled: false,
		minimumDurabilityLevel: DurabilityLevel.None,
		name: 'MythWarServer',
		numReplicas: 0,
		ramQuotaMB: 256,
		replicaIndexes: false,
		compressionMode: CompressionMode.Passive,
		maxExpiry: 0,
		storageBackend: StorageBackend.Couchstore,
	} as ICreateBucketSettings /* Stop it complaining about optional deprecated properties */,
];
