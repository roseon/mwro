import { Database } from '../../Database';
import type { ICollection } from '../../Interfaces/ICollection';
import type { IKeyReference } from '../../Interfaces/IKeyReference';
import type { MapJson } from './types';

export class GameDataCollection {
	private static instance: GameDataCollection | null = null;
	private collection: ICollection<unknown> | null = null;
	private maps: IKeyReference<MapJson[]> | null = null;

	private constructor() {}

	public static getInstance(): GameDataCollection {
		if (this.instance === null) this.instance = new GameDataCollection();

		return this.instance;
	}

	/**
	 * Get a reference to the map data.
	 */
	public async getMaps(): Promise<IKeyReference<MapJson[]>> {
		if (this.maps === null)
			this.maps = (await this.getCollection()).getReference('maps') as IKeyReference<
				MapJson[]
			>;

		return this.maps;
	}

	/**
	 * Get the gamedata collection.
	 */
	private async getCollection(): Promise<ICollection<unknown>> {
		if (this.collection === null) this.collection = await this.initCollection('GameData');

		return this.collection;
	}

	/**
	 * Create the collection this class uses.
	 * @param collectionName
	 */
	private async initCollection(collectionName: string): Promise<ICollection<unknown>> {
		let bucket = await Database.get().mainBucket();
		return bucket.collection(collectionName);
	}
}
