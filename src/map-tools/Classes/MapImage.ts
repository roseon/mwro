export enum MapImageLayer {
	Bottom = 128,
	Middle = 64,
	Top = 192,
}

export type MapPart = {
	column: number;
	row: number;
	jpg: Buffer;
};

export class MapImage {
	public readonly width: number;
	public readonly height: number;
	public readonly origX: number;
	public readonly origY: number;
	public readonly centerX: number;
	public readonly centerY: number;
	public readonly layer: MapImageLayer;
	private readonly dataOffset: number;
	private readonly dataSize: number;

	public constructor(private file: Buffer, offset: number) {
		let identifier = file.toString('ascii', offset, offset + 9);

		if (identifier !== 'IMG_HEAD\0') throw Error('Invalid map image');

		this.dataOffset = file.readInt32LE(offset + 0x14);
		this.dataSize = file.readInt32LE(offset + 0x18);
		this.width = file.readInt32LE(offset + 0x1c);
		this.height = file.readInt32LE(offset + 0x20);
		this.origX = file.readInt32LE(offset + 0x24);
		this.origY = file.readInt32LE(offset + 0x28);
		this.centerX = file.readInt16LE(offset + 0x2c);
		this.centerY = file.readInt16LE(offset + 0x2e);
		this.layer = file.readUInt8(offset + 0x30) & 0xc0;
	}

	public parseBottom(): MapPart[] {
		if (this.layer !== MapImageLayer.Bottom) throw Error('Wrong layer');

		let columns = this.file.readInt32LE(this.dataOffset);
		let rows = this.file.readInt32LE(this.dataOffset + 4);
		let start = this.file.readUInt32LE(this.dataOffset + 8 + 80 * 20);
		let parts: MapPart[] = [];

		for (let r = 0; r < rows; ++r) {
			for (let c = 0; c < columns; ++c) {
				let length = this.file.readUInt32LE(this.dataOffset + 8 + c * 4 + r * 80);
				let jpg = this.file.subarray(start, start + length);

				start += length;
				parts.push({ row: r, column: c, jpg });
			}
		}

		return parts;
	}
}
