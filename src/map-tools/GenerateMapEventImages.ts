import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import sharp from 'sharp';
import type { MapEvent } from './Classes/MapEventContainer';
import { MapEventFlag } from './Classes/MapEventContainer';
import { MapFile } from './Classes/MapFile';
import type { MapImage } from './Classes/MapImage';
import { getMapList, mergeMapParts } from './Utils';

// Creates map images with data from the EVENT section added.

let mapDir = 'client/map';
let destDir = 'output/map/event-images';

let maps = getMapList(mapDir);
console.log('Found ' + maps.length + ' maps');

if (maps.length > 0) mkdirSync(destDir, { recursive: true });

(async () => {
	for (let map of maps) {
		try {
			await createEventMaps(map);
		} catch (e: unknown) {
			console.log(...(e instanceof Error ? [e.message, e] : [e]));
			return;
		}
	}
})();

async function createEventMaps(map: string): Promise<void> {
	process.stdout.write(`Loading ${map}...`);
	let contents = readFileSync(mapDir + '/' + map);

	process.stdout.write(`\x1B[0GParsing ${map}...`);
	let mapFile = new MapFile(contents);
	let ec = mapFile.getMapEventContainer();
	let events = [...ec.getEvents()];
	let imageContainer = mapFile.getMapImageContainer();
	let mapImage: MapImage = imageContainer.getImages().next().value;
	let parts = mapImage.parseBottom();

	process.stdout.write(`\x1B[0GCreating image of ${map}...`);

	let image = await mergeMapParts(parts).png().toBuffer();
	let flags = [MapEventFlag.Shadow, MapEventFlag.Unk, MapEventFlag.Link, MapEventFlag.Block];

	for (let flag of flags) {
		let input = getOverlayForFlag(mapFile, events, flag);

		if (input === null) continue;

		let overlay: sharp.OverlayOptions = {
			left: 0,
			top: 0,
			input,
			raw: { channels: 4, width: mapFile.width, height: mapFile.height },
		};

		let result = sharp(image).composite([overlay]);
		let path =
			destDir + '/' + MapEventFlag[flag] + '/' + map.substring(0, map.length - 3) + 'jpg';

		process.stdout.write(`\x1B[0GSaving ${path}...`.padEnd(100));
		writeFileSync(path, await result.jpeg().toBuffer());
	}

	process.stdout.write(`\x1B[0GSaved map ${map}`.padEnd(100) + '\n');
}

function getOverlayForFlag(
	mapFile: MapFile,
	events: MapEvent[],
	flag: MapEventFlag,
): Buffer | null {
	let found = false;
	for (let event of events) {
		if ((event[2] & flag) !== 0) {
			found = true;
			break;
		}
	}

	if (!found) return null;

	let eventsBuffer = Buffer.alloc(mapFile.width * mapFile.height * 4);
	let eventCols = mapFile.width / mapFile.xCoordinatePixels;

	for (let y = 0; y < mapFile.height; ++y) {
		let eventRow = Math.floor(y / mapFile.yCoordinatePixels);

		for (let x = 0; x < mapFile.width; ++x) {
			let eventCol = Math.floor(x / mapFile.xCoordinatePixels);
			let event = events[eventRow * eventCols + eventCol];

			if ((event[2] & flag) === 0) continue;

			let offset = (y * mapFile.width + x) * 4;
			eventsBuffer.writeUInt8(0xff, offset);
			eventsBuffer.writeUInt8(0x33, offset + 1);
			eventsBuffer.writeUInt8(0xff, offset + 2);
			eventsBuffer.writeUInt8(0xa0, offset + 3);
		}
	}

	return eventsBuffer;
}
