import { MapControlContainer } from './MapControlContainer';
import { MapEventContainer } from './MapEventContainer';
import { MapImageContainer } from './MapImageContainer';

export class MapFile {
	public readonly xCoordinatePixels: number;
	public readonly yCoordinatePixels: number;
	public readonly width: number;
	public readonly height: number;

	private readonly imgPtr: number;
	private readonly eventPtr: number;
	private readonly controlPtr: number;

	public constructor(private file: Buffer) {
		let identifier = file.toString('ascii', 0x100, 0x109);

		if (identifier !== 'MAP_HEAD\0') throw Error('Invalid map file');

		this.xCoordinatePixels = file.readUInt32LE(0x128);
		this.yCoordinatePixels = file.readUInt32LE(0x12c);
		this.width = file.readUInt32LE(0x130);
		this.height = file.readUInt32LE(0x134);
		this.imgPtr = file.readUInt32LE(0x13c);
		this.eventPtr = file.readUInt32LE(0x140);
		this.controlPtr = file.readUInt32LE(0x144);
	}

	public getMapImageContainer(): MapImageContainer {
		return new MapImageContainer(this.file, this.imgPtr);
	}

	public getMapEventContainer(): MapEventContainer {
		return new MapEventContainer(this.file, this.eventPtr);
	}

	public getMapControlContainer(): MapControlContainer {
		return new MapControlContainer(this.file, this.controlPtr);
	}
}
