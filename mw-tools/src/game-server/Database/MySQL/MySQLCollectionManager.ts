import type { CollectionSpec, ICollectionManager } from '../Interfaces/ICollectionManager';
import { MySQLBucket } from './MySQLBucket';

export class MySQLCollectionManager implements ICollectionManager {
    constructor(private bucket: MySQLBucket) {}

    public async getAllCollections(): Promise<CollectionSpec[]> {
        const pool = this.bucket.getCluster().getPool();
        const dbName = this.bucket.getName();
        
        const [rows] = await pool.query('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?', [dbName]);
        
        return (rows as any[]).map((row: any) => ({
            name: row.TABLE_NAME,
            scopeName: '_default'
        }));
    }

    public async createCollection(settings: CollectionSpec): Promise<void> {
        const pool = this.bucket.getCluster().getPool();
        const dbName = this.bucket.getName();
        const tableName = settings.name;

        const query = `
            CREATE TABLE IF NOT EXISTS \`${dbName}\`.\`${tableName}\` (
                \`id\` VARCHAR(255) NOT NULL,
                \`data\` JSON,
                PRIMARY KEY (\`id\`)
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `;
        
        await pool.query(query);
    }
}
