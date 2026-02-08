import type { IKeyReference } from '../Interfaces/IKeyReference';
import type { FileCollection } from './FileCollection';

export class FileKeyReference<T> implements IKeyReference<T> {
	public constructor(private collection: FileCollection<T>, private key: string) {}

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
