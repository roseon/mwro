import type { Dirent } from 'fs';
import { opendirSync } from 'fs';

/**
 * Get a list of all files in the given directory,
 * as well as subdirectories.
 * @param path
 */
export function findAllFiles(path: string): string[] {
	let dir = opendirSync(path);
	let files: string[] = [];
	let entry: Dirent | null;

	while ((entry = dir.readSync()) !== null) {
		if (entry.isFile()) files.push(path + '/' + entry.name);
		else if (entry.isDirectory()) files.push(...findAllFiles(path + '/' + entry.name));
	}

	dir.closeSync();

	return files;
}
