import type { Dirent } from 'fs';
import { opendirSync } from 'fs';
import sharp from 'sharp';
import type { MapPart } from './Classes/MapImage';

export function endAtZero(str: string): string {
	let index = str.indexOf('\0');
	return index === -1 ? str : str.substring(0, index);
}

export function getMapNumber(filename: string): number {
	return Number.parseInt(filename.substring(3, 6));
}

export function getMapList(path: string): string[] {
	let dir = opendirSync(path);
	let files: string[] = [];
	let entry: Dirent | null;

	while ((entry = dir.readSync())) {
		if (entry.isFile() && entry.name.substring(entry.name.length - 4).toLowerCase() === '.map')
			files.push(entry.name);
	}

	dir.closeSync();

	return files;
}

export function mergeMapParts(parts: MapPart[]): sharp.Sharp {
	let columns = Math.max(...parts.map(p => p.column)) + 1;
	let rows = Math.max(...parts.map(p => p.row)) + 1;

	return sharp({
		create: {
			background: { r: 0, g: 0, b: 0 },
			channels: 3,
			width: columns * 800,
			height: rows * 600,
		},
	}).composite(
		parts.map(part => ({
			input: part.jpg,
			left: part.column * 800,
			top: part.row * 600,
		})),
	);
}
