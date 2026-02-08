import type { OptionalParams } from '../../Utils/TypeUtils';
import { Database } from '../Database';
import type { ICollection } from '../Interfaces/ICollection';

export abstract class BaseCollection<
	T,
	TJson,
	TDeps extends Record<string, unknown> | undefined = undefined,
	TKey extends string = string,
> {
	protected collection: Promise<ICollection<TJson>>;

	protected constructor(collectionName: string) {
		this.collection = this.initCollection(collectionName);
	}

	/**
	 * Retrieve an object by key.
	 * @param key
	 * @param deps
	 */
	public async get(key: TKey, ...deps: OptionalParams<TDeps>): Promise<T> {
		let col = await this.collection;
		let value = await col.get(key);

		return this.fromJson(value, ...deps);
	}

	/**
	 * Retrieve all objects from this collection.
	 * @param deps
	 */
	public async getAll(...deps: OptionalParams<TDeps>): Promise<T[]> {
		let col = await this.collection;
		let values = await col.getAll();

		return values.map(value => this.fromJson(value, ...deps));
	}

	/**
	 * Add or replace an object to the collection.
	 * @param value
	 */
	public async upsert(value: T): Promise<void> {
		let key = this.getKey(value);
		let obj = this.toJson(value);
		await this.upsertJson(key, obj);
	}

	/**
	 * Add or replace a json object to the collection.
	 * @param key
	 * @param obj
	 */
	public async upsertJson(key: TKey, obj: TJson): Promise<void> {
		let col = await this.collection;
		await col.upsert(key, obj);
	}

	/**
	 * Remove an object from the collection by key.
	 * @param key
	 */
	public async remove(key: TKey): Promise<void> {
		let col = await this.collection;
		await col.remove(key);
	}

	/**
	 * Check if a key exists in the collection.
	 * @param key
	 */
	public async exists(key: TKey): Promise<boolean> {
		let col = await this.collection;
		return col.exists(key);
	}

	/**
	 * Get the key for the given object.
	 * @param obj
	 */
	public abstract getKey(obj: T): TKey;

	/**
	 * Create the collection this class uses.
	 * @param collectionName
	 */
	protected async initCollection(collectionName: string): Promise<ICollection<TJson>> {
		let bucket = await Database.get().mainBucket();

		return (await bucket.collection(collectionName)) as ICollection<TJson>;
	}

	/**
	 * Convert object to json.
	 * @param obj
	 */
	protected abstract toJson(obj: T): TJson;

	/**
	 * Convert json to object.
	 * @param json
	 * @param deps
	 */
	protected abstract fromJson(json: TJson, ...deps: OptionalParams<TDeps>): T;
}
