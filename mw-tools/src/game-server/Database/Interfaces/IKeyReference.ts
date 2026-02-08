export interface IKeyReference<T> {
	/**
	 * Retrieve the document.
	 */
	get(): Promise<T>;

	/**
	 * Add or replace the document.
	 * @param value
	 */
	upsert(value: T): Promise<void>;

	/**
	 * Remove the document.
	 */
	remove(): Promise<void>;

	/**
	 * Check if the key exists.
	 */
	exists(): Promise<boolean>;
}
