import type { ICollection } from '../Interfaces/ICollection';
import type { IKeyReference } from '../Interfaces/IKeyReference';
import { MySQLBucket } from './MySQLBucket';
import { MySQLKeyReference } from './MySQLKeyReference';

export class MySQLCollection<T> implements ICollection<T> {
    constructor(private bucket: MySQLBucket, private name: string) {}

    private getTableName(): string {
        return `\`${this.bucket.getName()}\`.\`${this.name}\``;
    }

    public async get(key: string): Promise<T> {
        const pool = this.bucket.getCluster().getPool();
        const [rows] = await pool.query(`SELECT data FROM ${this.getTableName()} WHERE id = ?`, [key]);
        const results = rows as any[];
        if (results.length === 0) throw new Error('Document not found');
        
        let data = results[0].data;
        if (typeof data === 'string') {
             try {
                 data = JSON.parse(data);
             } catch (e) {}
        }
        return data as T;
    }

    public async upsert(key: string, value: T): Promise<void> {
        const pool = this.bucket.getCluster().getPool();
        const jsonVal = JSON.stringify(value);
        await pool.query(`INSERT INTO ${this.getTableName()} (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)`, [key, jsonVal]);
    }

    public async remove(key: string): Promise<void> {
        const pool = this.bucket.getCluster().getPool();
        await pool.query(`DELETE FROM ${this.getTableName()} WHERE id = ?`, [key]);
    }

    public async exists(key: string): Promise<boolean> {
        const pool = this.bucket.getCluster().getPool();
        const [rows] = await pool.query(`SELECT 1 FROM ${this.getTableName()} WHERE id = ?`, [key]);
        return (rows as any[]).length > 0;
    }

    public getReference(key: string): IKeyReference<T> {
        return new MySQLKeyReference(this, key);
    }

    public async getAll(): Promise<T[]> {
        const pool = this.bucket.getCluster().getPool();
		const [rows] = await pool.query(`SELECT id, data FROM ${this.getTableName()}`);
		const results: T[] = [];

		for (const row of rows as any[]) {
			let d = row.data;
			if (typeof d === 'string') {
				try {
					d = JSON.parse(d);
				} catch (error) {
					console.warn(`Skipping invalid JSON row in ${this.name}.`, error);
					await pool.query(`DELETE FROM ${this.getTableName()} WHERE id = ?`, [row.id]);
					continue;
				}
			}
			if (d !== null && typeof d !== 'undefined') {
				results.push(d as T);
			}
		}

		return results;
    }

    public async maxKey(): Promise<number> {
        const pool = this.bucket.getCluster().getPool();
        const [rows] = await pool.query(`SELECT MAX(CAST(id AS UNSIGNED)) as maxKey FROM ${this.getTableName()}`);
        const res = (rows as any[])[0].maxKey;
        return res === null ? 0 : Number(res);
    }
}
