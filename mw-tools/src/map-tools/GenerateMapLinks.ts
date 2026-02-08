import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import type { MapEvent } from './Classes/MapEventContainer';
import { MapEventFlag } from './Classes/MapEventContainer';
import { MapFile } from './Classes/MapFile';
import { getMapList, getMapNumber } from './Utils';

/*
Creates binary files with map-cell data.
Each cell is 1 byte, they are placed row by row.

The 8th (leftmost) bit means the cell is blocked and cannot be walked on.
The 7th bit means the cell is a link to another map.
The first 6 bits (cell & 0x3F) contain the ID of the link.

All links are saved in json.
*/

type SimpleMapData = {
	map: number;
	width: number;
	height: number;
	links: SimpleMapLink[];
};

type SimpleMapLink = {
	id: number;
	map: number;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

let mapDir = 'client/map';
let destDir = 'output/map';
let linksFilename = destDir + '/mapData.json';
let cellsDir = destDir + '/cells';

let maps = getMapList(mapDir);
console.log('Found ' + maps.length + ' maps');

if (maps.length > 0) {
	mkdirSync(destDir, { recursive: true });
	mkdirSync(cellsDir, { recursive: true });
}

let linkData: SimpleMapData[] = [];

for (let map of maps) {
	let file = readFileSync(mapDir + '/' + map);
	let mf = new MapFile(file);
	let cc = mf.getMapControlContainer();
	let ec = mf.getMapEventContainer();
	let events = [...ec.getEvents()];
	let buffer = Buffer.alloc(events.length);

	for (let event of events) writeEvent(buffer, event);

	linkData.push({
		map: getMapNumber(map),
		width: mf.width,
		height: mf.height,
		links: [...cc.getLinks()].map(link => ({
			id: link.id,
			map: getMapNumber(link.filename),
			x1: link.startX,
			y1: link.startY,
			x2: link.endX,
			y2: link.endY,
		})),
	});

	let fname = cellsDir + '/' + getMapNumber(map) + '.bin';
	writeFileSync(fname, buffer);
	console.log('Saved cell-data to ' + fname);
}

writeFileSync(linksFilename, JSON.stringify(linkData));
console.log('Saved to linkdata to ' + linksFilename);

function writeEvent(buffer: Buffer, event: MapEvent): void {
	let isLink = event[2] & MapEventFlag.Link;
	let isBlocked = event[2] & MapEventFlag.Block;
	let flag = isBlocked ? 0x80 : isLink ? 0x40 | (event[1] & 0x3f) : 0;
	buffer.writeUInt8(flag, event[0]);
}
