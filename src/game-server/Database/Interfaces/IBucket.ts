import type { ICollection } from './ICollection';
import type { ICollectionManager } from './ICollectionManager';

export interface IBucket {
	/**
	 * Open a collection.
	 * @param name
	 * @param scope
	 */
	collection(name: string, scope?: string | null): Promise<ICollection<unknown>>;

	/**
	 * Get the collection manager.
	 */
	collections(): ICollectionManager;
}
