import type { PixelData } from './image';

export type PixelDataRays = PixelData & {
	centerX: number;
	centerY: number;
};

/**
 * Check if the file is a rays image file.
 * @param buffer
 */
export function isRaysImageFile(buffer: Buffer): boolean {
	return buffer.toString('ascii', 0, 16) === 'RAYS IMG256 FILE';
}

/**
 * Get the pixel data out of a rays image file.
 * Returned contents are in RGBA format.
 * @param buffer
 */
export function parseRaysImage(buffer: Buffer): PixelDataRays | null {
	if (buffer.length < 0x328) return null;

	let width = buffer.readUInt16LE(20);
	let height = buffer.readUInt16LE(22);
	let result = Buffer.alloc(width * height * 4, 0, 'binary');
	let offset = 0;
	let i = 0x328;
	let l = buffer.length;

	while (i < l) {
		let type = buffer[i];
		++i;

		// Skip pixels
		if (type === 0xfe) {
			let count = buffer[i] + (buffer[i + 1] << 8);
			offset += count * 4;
			i += 2;
		}
		// Copy pixels
		else if (type === 0xff) {
			let count = (buffer[i] + (buffer[i + 1] << 8)) * 2;
			i += 2;

			for (let j = 0; j < count; j += 2) {
				let color = 0x24 + buffer[i + j] * 3;
				result[offset] = buffer[color];
				result[offset + 1] = buffer[color + 1];
				result[offset + 2] = buffer[color + 2];
				result[offset + 3] = buffer[i + j + 1];
				offset += 4;
			}

			i += count;
		}
	}

	return {
		width,
		height,
		data: result,
		centerX: buffer.readInt16LE(28),
		centerY: buffer.readInt16LE(30),
	};
}
