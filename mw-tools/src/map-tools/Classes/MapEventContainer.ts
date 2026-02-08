export enum MapEventFlag {
	Shadow = 0x10,
	Unk = 0x20,
	Link = 0x40,
	Block = 0x80,
}

export type MapEvent = [index: number, event: number, flag: number];

export class MapEventContainer {
	private readonly count: number;
	private readonly eventOffset: number;

	public constructor(private file: Buffer, offset: number) {
		let identifier = file.toString('ascii', offset, offset + 6);

		if (identifier !== 'EVENT\0') throw Error('Invalid event section');

		this.count = file.readUInt32LE(offset + 0x14);
		this.eventOffset = file.readUInt32LE(offset + 0x18);
	}

	public *getEvents(): IterableIterator<MapEvent> {
		for (let i = 0; i < this.count; ++i) {
			let event = this.file.readUInt8(this.eventOffset + i * 2);
			let flag = this.file.readUInt8(this.eventOffset + i * 2 + 1);

			yield [i, event, flag];
		}
	}
}
