import { endAtZero } from '../Utils';

export class MapEffect {
	public readonly filename: string;
	public readonly x: number;
	public readonly y: number;

	public constructor(file: Buffer, offset: number) {
		this.filename = endAtZero(file.toString('ascii', offset, offset + 0x4f));
		this.x = file.readInt32LE(offset + 0x50);
		this.y = file.readInt32LE(offset + 0x54);
		// 0x58: 0 for wav files, 1 for mda files
		// 0x5C: unknown, 0 or 1
	}
}
