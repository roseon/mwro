import type { PacketType } from './PacketType';

type StructWriter = {
	size: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	write: (packet: Packet, offset: number, ...params: any[]) => void;
};

type GetStructWriterParams<T extends StructWriter> = T['write'] extends (
	packet: Packet,
	offset: number,
	...params: infer P
) => void
	? P
	: never;

/**
 * Creates a packet for the given size. Fills in the first 8 bytes.
 * @param size
 */
export function createPacket(size: number): Buffer {
	if (size < 12) throw Error('Packet too small.');

	let arr = Buffer.alloc(size, 0, 'binary');

	// Required header
	arr[0] = 0x55;
	arr[1] = 0x47;

	// Packet length - 4
	arr.writeUInt16LE(size - 4, 2);

	/* Mysterious bytes.
	 * Sometimes these have to be 0, or anything higher than 0,
	 * sometimes a specific value, and other times used as loop count.
	 * They might be read as two seperate 16 bit ints, or as one 32 bit int.
	 * Sometimes used as signed, sometimes as unsigned.
	 * Ideally these would default as 0 and set specifically for each packet.
	 * Setting them lower may slightly increase client performance when used in a loop.
	 * Currently set to the maximum signed values, to make testing easier.
	 * When setting them too low, sometimes a part of the packet is ignored,
	 * which is really annoying when debugging.
	 * If a packet is ever giving issues, look into changing these bytes.
	 */
	arr.writeUInt32LE(0x7fff7fff, 4);

	return arr;
}

export class Packet {
	public readonly buffer: Buffer;

	public constructor(size: number, type: PacketType) {
		this.buffer = createPacket(size);
		this.uint32(8, type);
	}

	public int8(offset: number, value: number): this {
		this.buffer.writeInt8(value, offset);
		return this;
	}

	public uint8(offset: number, value: number): this {
		this.buffer.writeUInt8(value, offset);
		return this;
	}

	public int16(offset: number, value: number): this {
		this.buffer.writeInt16LE(value, offset);
		return this;
	}

	public uint16(offset: number, value: number): this {
		this.buffer.writeUInt16LE(value, offset);
		return this;
	}

	public int32(offset: number, value: number): this {
		this.buffer.writeInt32LE(value, offset);
		return this;
	}

	public uint32(offset: number, value: number): this {
		this.buffer.writeUInt32LE(value, offset);
		return this;
	}

	public float(offset: number, value: number): this {
		this.buffer.writeFloatLE(value, offset);
		return this;
	}

	public string(offset: number, string: string, maxLength?: number): this {
		if (maxLength === undefined) this.buffer.write(string, offset, 'ascii');
		else this.buffer.write(string, offset, maxLength, 'ascii');

		return this;
	}

	public binary(offset: number, data: Buffer): this {
		data.copy(this.buffer, offset);
		return this;
	}

	public struct<T extends StructWriter>(
		offset: number,
		struct: T,
		...params: GetStructWriterParams<T>
	): this {
		struct.write(this, offset, ...params);
		return this;
	}
}
