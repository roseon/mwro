import type { IKeyReference } from './IKeyReference';

export interface ICollection<T> {
	/**
	 * Retrieve a document.
	 * @param key
	 */
	get(key: string): Promise<T>;

	/**
	 * Add or replace a document.
	 * @param key
	 * @param value
	 */
	upsert(key: string, value: T): Promise<void>;

	/**
	 * Remove a document.
	 * @param key
	 */
	remove(key: string): Promise<void>;

	/**
	 * Check if a document-key exists.
	 * @param key
	 */
	exists(key: string): Promise<boolean>;

	/**
	 * Get a reference to a document.
	 * @param key
	 */
	getReference(key: string): IKeyReference<T>;

	/**
	 * Get all documents in this collection.
	 */
	getAll(): Promise<T[]>;

	/**
	 * Retrieve max key in this collection.
	 */
	maxKey(): Promise<number>;
}
