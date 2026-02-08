import type { Bucket, Collection, Scope } from 'couchbase';
import type { ICollection } from '../Interfaces/ICollection';
import type { IKeyReference } from '../Interfaces/IKeyReference';
import { CBKeyReference } from './CBKeyReference';

export class CBCollection<T> implements ICollection<T> {
	private scope: Scope;
	private collection: Collection;

	public constructor(bucket: Bucket, private name: string, scopeName: string = '_default') {
		if (!this.isValidDbName(scopeName) || !this.isValidDbName(name))
			throw Error('Invalid collection name.');

		this.scope = bucket.scope(scopeName);
		this.collection = this.scope.collection(name);
	}

	public async get(key: string): Promise<T> {
		return (await this.collection.get(key)).content;
	}

	public async upsert(key: string, value: T): Promise<void> {
		await this.collection.upsert(key, value);
	}

	public async remove(key: string): Promise<void> {
		await this.collection.remove(key);
	}

	public async exists(key: string): Promise<boolean> {
		return (await this.collection.exists(key)).exists;
	}

	public getReference(key: string): IKeyReference<T> {
		return new CBKeyReference(this, key);
	}

	public async getAll(): Promise<T[]> {
		try {
			let query = `SELECT * FROM \`${this.name}\``;
			let res = await this.scope.query(query);
			let rows = res.rows as Record<string, unknown>[];

			return rows.map(o => o[this.name] as T);
		} catch (e: unknown) {
			if (e instanceof Error && e.message === 'path exists')
				throw Error(
					'Couchbase "path exists" error, index might be missing on ' + this.name,
				);

			throw e;
		}
	}

	public async maxKey(): Promise<number> {
		// TODO Get max key from couchbase
		try {
			return 0;
		} catch (e: unknown) {
			if (e instanceof Error && e.message === 'path exists')
				throw Error(
					'Couchbase "path exists" error, index might be missing on ' + this.name,
				);

			throw e;
		}
	}

	private isValidDbName(str: string): boolean {
		return /^[a-zA-Z0-9_]+$/.test(str);
	}
}
