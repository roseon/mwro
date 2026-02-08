import { RIFFFile } from 'riff-file';

type Chunk = {
	chunkId: string;
	chunkSize: number;
	format?: string;
	chunkData?: {
		start: number;
		end: number;
	};
	subChunks?: Chunk[];
};

type RiffItem = {
	name: string;
	format?: string;
	contents: Buffer;
};

/**
 * Check for the riff header.
 * @param buffer
 */
export function isRiff(buffer: Buffer): boolean {
	return buffer.toString('ascii', 0, 4) === 'RIFF';
}

/**
 * Get all separate items in a riff file.
 * @param buffer
 */
export function getRiffFiles(buffer: Buffer): RiffItem[] {
	let riff = new RIFFFile();
	riff.setSignature(buffer);
	let sig = riff.signature as Chunk;

	return getAllChunkData(buffer, sig);
}

function getAllChunkData(buffer: Buffer, chunk: Chunk, prefix: string = ''): RiffItem[] {
	let data: RiffItem[] = [];

	if (chunk.chunkData) {
		data.push({
			name: prefix + chunk.chunkId,
			contents: buffer.subarray(chunk.chunkData.start, chunk.chunkData.end),
			format: chunk.format,
		});
	}

	if (chunk.subChunks) {
		for (let subChunk of chunk.subChunks) {
			data.push(...getAllChunkData(buffer, subChunk, chunk.chunkId + '/'));
		}
	}

	return data;
}
