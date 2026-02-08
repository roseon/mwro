import sharp from 'sharp';

export type PixelData = {
	width: number;
	height: number;
	data: Buffer;
};

/**
 * Turns a buffer of RGBA data into a png.
 * @param pixelData
 */
export async function pixelDataToPNG(pixelData: PixelData): Promise<Buffer> {
	return sharp(pixelData.data, {
		raw: {
			channels: 4,
			height: pixelData.height,
			width: pixelData.width,
		},
	})
		.png()
		.toBuffer();
}

/**
 * Turns a stream of RGBA data into a tga.
 * @param pixelData
 */
export function pixelDataToTGA(pixelData: PixelData): Buffer {
	let header = 18;
	let buffer = Buffer.alloc(pixelData.data.length + header);

	buffer.writeUInt8(2, 2);
	buffer.writeUInt16LE(pixelData.width, 12);
	buffer.writeUInt16LE(pixelData.height, 14);
	buffer.writeUInt16LE(0x2020, 16);

	// Switch from rgba to bgra
	for (let i = 0; i < pixelData.data.length; i += 4) {
		buffer[header + i] = pixelData.data[i + 2];
		buffer[header + i + 1] = pixelData.data[i + 1];
		buffer[header + i + 2] = pixelData.data[i];
		buffer[header + i + 3] = pixelData.data[i + 3];
	}

	return buffer;
}

/**
 * Check for jpeg header.
 * @param data
 */
export function isJPG(data: Buffer): boolean {
	return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff && data[3] === 0xe0;
}

/**
 * Pastes the source image into the destination image.
 * @param src
 * @param dst
 * @param left
 * @param top
 */
export function imageOverlay(src: PixelData, dst: PixelData, left: number, top: number): void {
	let srcRowSize = src.width * 4;
	let dstRowSize = dst.width * 4;

	for (let y = 0; y < src.height; ++y) {
		let srcOffset = y * srcRowSize;
		let dstOffset = (top + y) * dstRowSize + left * 4;

		src.data.copy(dst.data, dstOffset, srcOffset, srcOffset + srcRowSize);
	}
}
