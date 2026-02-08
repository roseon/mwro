import { getConfig } from '../Config/Config';
import { CBCluster } from './Couchbase/CBCluster';
import { FileCluster } from './File/FileCluster';
import { MySQLCluster } from './MySQL/MySQLCluster';
import type { IBucket } from './Interfaces/IBucket';
import type { ICluster } from './Interfaces/ICluster';

export class Database {
	private static instance: Database | null = null;
	public readonly cluster: ICluster;
	private bucket: IBucket | null = null;

	protected constructor() {
		let config = getConfig();

		if (config.databaseType === 'file')
			this.cluster = new FileCluster(module.path + '/../file-storage');
		else if (config.databaseType === 'couchbase')
			this.cluster = new CBCluster(
				config.couchbase.host,
				config.couchbase.username,
				config.couchbase.password,
			);
		else if (config.databaseType === 'mysql')
			this.cluster = new MySQLCluster(config.mysql);
		else throw Error('Invalid config.databaseType');
	}

	/**
	 * Get an instance of this class.
	 */
	public static get(): Database {
		if (this.instance === null) this.instance = new Database();

		return this.instance;
	}

	/**
	 * Closes the cluster and unsets the instance.
	 */
	public static async reset(): Promise<void> {
		if (this.instance !== null) {
			await this.instance.cluster.close();
			this.instance = null;
		}
	}

	/**
	 * Get the main bucket for the server.
	 */
	public async mainBucket(): Promise<IBucket> {
		if (this.bucket === null) this.bucket = await this.cluster.bucket('MythWarServer');

		return this.bucket;
	}
}
