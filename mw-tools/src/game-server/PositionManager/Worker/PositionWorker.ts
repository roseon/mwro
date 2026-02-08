import 'source-map-support/register';
import { parentPort, workerData } from 'worker_threads';
import { WorkerPositionPlayerData } from './WorkerPositionPlayerData';

export type PositionWorkerParams = {
	playerData: SharedArrayBuffer;
	mapData: {
		map: number;
		width: number;
		height: number;
		cells: SharedArrayBuffer;
	}[];
};

if (!parentPort) throw Error('PositionWorker must be called as a worker.');

const workerParams: PositionWorkerParams = workerData;

let positionPlayerData = new WorkerPositionPlayerData(workerParams.playerData);

for (let map of workerParams.mapData) {
	positionPlayerData.initMap(map.map, map.width, map.height, Buffer.from(map.cells));
}

/**
 * The loop that updates the player coordinates.
 */
function run(): void {
	try {
		let updates = positionPlayerData.updatePositions();
		if (updates.length) parentPort!.postMessage(updates);
	} catch (error) {
		// Log error to parent if possible, or just ignore to keep worker alive
		if (parentPort) {
			parentPort.postMessage({ type: 'error', error });
		}
	}

	setTimeout(run, 500);
}

run();
