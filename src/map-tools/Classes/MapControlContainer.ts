import { MapEffect } from './MapEffect';
import { MapLink } from './MapLink';

export class MapControlContainer {
	private readonly effectCount: number;
	private readonly linkCount: number;
	private readonly effectOffset: number;
	private readonly linkOffset: number;

	public constructor(private file: Buffer, offset: number) {
		let identifier = file.toString('ascii', offset, offset + 8);

		if (identifier !== 'CONTROL\0') throw Error('Invalid control section');

		this.effectCount = file.readUInt32LE(offset + 0x14);
		this.linkCount = file.readUInt32LE(offset + 0x18);
		this.effectOffset = file.readUInt32LE(offset + 0x1c);
		this.linkOffset = file.readUInt32LE(offset + 0x20);
	}

	public *getEffects(): IterableIterator<MapEffect> {
		for (let i = 0; i < this.effectCount; ++i) {
			yield new MapEffect(this.file, this.effectOffset + i * 96);
		}
	}

	public *getLinks(): IterableIterator<MapLink> {
		for (let i = 0; i < this.linkCount; ++i) {
			yield new MapLink(this.file, this.linkOffset + i * 228);
		}
	}
}
