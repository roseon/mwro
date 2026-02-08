import type { IKeyReference } from '../Interfaces/IKeyReference';
import type { CBCollection } from './CBCollection';

export class CBKeyReference<T> implements IKeyReference<T> {
	public constructor(private collection: CBCollection<T>, private key: string) {}

	public async get(): Promise<T> {
		return this.collection.get(this.key);
	}

	public async upsert(value: T): Promise<void> {
		await this.collection.upsert(this.key, value);
	}

	public async remove(): Promise<void> {
		await this.collection.remove(this.key);
	}

	public async exists(): Promise<boolean> {
		return this.collection.exists(this.key);
	}
}
