import { MapImage } from './MapImage';

export class MapImageContainer {
	private readonly listSize: number;
	private readonly listPtr: number;

	public constructor(private file: Buffer, offset: number) {
		let identifier = file.toString('ascii', offset, offset + 8);

		if (identifier !== 'MAP_IMG\0') throw Error('Invalid image section');

		this.listSize = file.readUInt32LE(offset + 0x14);
		this.listPtr = file.readUInt32LE(offset + 0x18);
	}

	public *getImages(): IterableIterator<MapImage> {
		for (let i = 0; i < this.listSize; ++i) {
			let offset = this.file.readUInt32LE(this.listPtr + i * 4);
			yield new MapImage(this.file, offset);
		}
	}
}
