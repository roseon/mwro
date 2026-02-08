import type { Dirent } from 'fs';
import { existsSync, opendirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import type { ICollection } from '../Interfaces/ICollection';
import type { IKeyReference } from '../Interfaces/IKeyReference';
import type { FileBucket } from './FileBucket';
import { FileKeyReference } from './FileKeyReference';

export class FileCollection<T> implements ICollection<T> {
	private path: string;
	private readonly fileOptions: { encoding: 'utf8' } = { encoding: 'utf8' };

	public constructor(bucket: FileBucket, name: string, scope: string = '_default') {
		this.path = `${bucket.getPath()}/${scope}/${name}/`;
	}

	public async get(key: string): Promise<T> {
		return JSON.parse(readFileSync(this.getKeyPath(key), this.fileOptions));
	}

	public async upsert(key: string, value: T): Promise<void> {
		writeFileSync(this.getKeyPath(key), JSON.stringify(value), this.fileOptions);
	}

	public async remove(key: string): Promise<void> {
		unlinkSync(this.getKeyPath(key));
	}

	public async exists(key: string): Promise<boolean> {
		return existsSync(this.getKeyPath(key));
	}

	public getReference(key: string): IKeyReference<T> {
		return new FileKeyReference(this, key);
	}

	public async getAll(): Promise<T[]> {
		let dir = opendirSync(this.path);
		let entry: Dirent | null;
		let files: string[] = [];

		while ((entry = dir.readSync())) {
			if (entry.isFile() && entry.name.endsWith('.json')) files.push(entry.name);
		}

		let items: T[] = await Promise.all(
			files.map(async fname => {
				let text = await readFile(this.path + '/' + fname, { encoding: 'utf8' });
				return JSON.parse(text);
			}),
		);

		return items;
	}

	public async maxKey(): Promise<number> {
		let dir = opendirSync(this.path);
		let entry: Dirent | null;
		let files: string[] = [];
		let numbers: number[] = [];
		while ((entry = dir.readSync())) {
			if (entry.isFile() && entry.name.endsWith('.json')) files.push(entry.name);
		}

		if (files.length < 1) return 0;

		for (let fullpath of files) {
			if (fullpath) {
				let number = fullpath.replace(/^.*(\\|\/|\:)/, '');
				numbers.push(parseInt(number));
			}
		}

		return Math.max(...numbers);
	}

	private getKeyPath(key: string): string {
		return this.path + key + '.json';
	}
}
