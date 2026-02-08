import type { IBucketSettings } from 'couchbase';
import type { IBucketManager } from '../Interfaces/IBucketManager';
import { MySQLCluster } from './MySQLCluster';

export class MySQLBucketManager implements IBucketManager {
    constructor(private cluster: MySQLCluster) {}

    public async getAllBuckets(): Promise<IBucketSettings[]> {
        const [rows] = await this.cluster.getPool().query('SHOW DATABASES');
        return (rows as any[]).map((row: any) => ({
            name: row.Database,
            flushEnabled: false,
            ramQuotaMB: 0,
            numReplicas: 0,
            replicaIndex: false,
            bucketType: undefined,
            conflictResolutionType: undefined,
            evictionPolicy: undefined,
            maxTTL: 0,
            compressionMode: undefined
        }));
    }

    public async createBucket(settings: IBucketSettings): Promise<void> {
        await this.cluster.getPool().query(`CREATE DATABASE IF NOT EXISTS \`${settings.name}\``);
    }
}
