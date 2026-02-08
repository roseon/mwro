export type CollectionSpec = {
	name: string;
	scopeName: string;
	primaryIndex?: boolean;
};

export interface ICollectionManager {
	/**
	 * Get a list of collections.
	 */
	getAllCollections(): Promise<CollectionSpec[]>;

	/**
	 * Create a new collections.
	 * @param settings
	 */
	createCollection(settings: CollectionSpec): Promise<void>;
}
