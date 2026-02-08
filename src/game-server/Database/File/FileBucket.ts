import type { IBucket } from '../Interfaces/IBucket';
import type { ICollection } from '../Interfaces/ICollection';
import type { ICollectionManager } from '../Interfaces/ICollectionManager';
import type { FileCluster } from './FileCluster';
import { FileCollection } from './FileCollection';
import { FileCollectionManager } from './FileCollectionManager';

export class FileBucket implements IBucket {
	private path: string;

	public constructor(cluster: FileCluster, name: string) {
		this.path = cluster.getPath() + '/' + name;
	}

	public getPath(): string {
		return this.path;
	}

	public async collection(
		name: string,
		scope: string = '_default',
	): Promise<ICollection<unknown>> {
		return new FileCollection(this, name, scope);
	}

	public collections(): ICollectionManager {
		return new FileCollectionManager(this);
	}
}
