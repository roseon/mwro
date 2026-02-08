import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { MapFile } from './Classes/MapFile';
import type { MapImage } from './Classes/MapImage';
import { getMapList, mergeMapParts } from './Utils';

// Converts the base map image to a full-sized jpg.

let mapDir = 'client/map';
let destDir = 'output/map/images';

let maps = getMapList(mapDir);
console.log('Found ' + maps.length + ' maps');

if (maps.length > 0) mkdirSync(destDir, { recursive: true });

(async () => {
	for (let map of maps) {
		try {
			process.stdout.write(`Loading ${map}...`);
			let contents = readFileSync(mapDir + '/' + map);

			process.stdout.write(`\x1B[0GParsing ${map}...`);
			let mapFile = new MapFile(contents);
			let imageContainer = mapFile.getMapImageContainer();
			let mapImage: MapImage = imageContainer.getImages().next().value;
			let parts = mapImage.parseBottom();

			process.stdout.write(`\x1B[0GCreating image of ${map}...`);
			let image = await mergeMapParts(parts);

			let path = destDir + '/' + map.substring(0, map.length - 3) + 'jpg';
			process.stdout.write(`\x1B[0GSaving ${path}...`);
			writeFileSync(path, await image.jpeg().toBuffer());

			process.stdout.write(`\x1B[0GSaved map ${map} to ${path}\n`);
		} catch (e: unknown) {
			console.log(...(e instanceof Error ? [e.message, e] : [e]));
			return;
		}
	}
})();
