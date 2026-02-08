import { createPool, Pool } from 'mysql2/promise';
import type { IBucket } from '../Interfaces/IBucket';
import type { IBucketManager } from '../Interfaces/IBucketManager';
import type { ICluster } from '../Interfaces/ICluster';
import { MySQLBucket } from './MySQLBucket';
import { MySQLBucketManager } from './MySQLBucketManager';

export class MySQLCluster implements ICluster {
	private pool: Pool;

	constructor(config: { host: string; port: number; user: string; password: string }) {
		this.pool = createPool({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
            namedPlaceholders: true
		});
	}

    public getPool(): Pool {
        return this.pool;
    }

	public async bucket(name: string): Promise<IBucket> {
		return new MySQLBucket(this, name);
	}

	public async buckets(): Promise<IBucketManager> {
		return new MySQLBucketManager(this);
	}

	public async close(): Promise<void> {
		await this.pool.end();
	}
}
