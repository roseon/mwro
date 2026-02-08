import { mkdirSync } from 'fs';
import type { IBucket } from '../Interfaces/IBucket';
import type { IBucketManager } from '../Interfaces/IBucketManager';
import type { ICluster } from '../Interfaces/ICluster';
import { FileBucket } from './FileBucket';
import { FileBucketManager } from './FileBucketManager';

export class FileCluster implements ICluster {
	public constructor(private path: string) {
		mkdirSync(this.path, { recursive: true });
	}

	public getPath(): string {
		return this.path;
	}

	public async bucket(name: string): Promise<IBucket> {
		return new FileBucket(this, name);
	}

	public async buckets(): Promise<IBucketManager> {
		return new FileBucketManager(this);
	}

	public async close(): Promise<void> {
		return;
	}
}
