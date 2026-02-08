export type MdaData = {
	animFrames: number;
	animData: Buffer;
	files: {
		name: string;
		contents: Buffer;
	}[];
};

export type AnimData = {
	name: string;
	frames: string[];
};

/**
 * Check if the file is an MDA file.
 * @param buffer
 */
export function isMDA(buffer: Buffer): boolean {
	return buffer.toString('ascii', 0, 15) === 'RAYS MEDIA FILE';
}

/**
 * Retrieve all files out of an mda file.
 * @param mda
 */
export function readMda(mda: Buffer): MdaData {
	let count = mda.readUInt32LE(24);
	let animDataStart = mda.readUInt32LE(36);
	let animDataLength = mda.readUInt32LE(animDataStart);

	let mdaData: MdaData = {
		animFrames: mda.readUInt32LE(28),
		animData: mda.subarray(animDataStart + 4, animDataStart + 4 + animDataLength),
		files: [],
	};

	for (let i = 0; i < count; ++i) {
		let offset = 40 + i * 40;

		if (mda.length < offset + 40) break;

		let nameEnd = mda.subarray(offset, offset + 32).indexOf(0);

		if (nameEnd === -1) nameEnd = 32;

		let name = mda.toString('ascii', offset, offset + nameEnd);
		let loc = mda.readUInt32LE(offset + 32);
		let size = mda.readUInt32LE(offset + 36);
		let contents = mda.subarray(loc, loc + size);

		mdaData.files.push({ name, contents });
	}

	return mdaData;
}

/**
 * Parse the animation data.
 * @param data
 */
export function parseAnimData(data: Buffer): AnimData[] {
	let l = data.length;
	let i = 0;
	let anims: AnimData[] = [];
	let anim: AnimData | null = null;

	while (i < l) {
		let type = data[i];
		let size = data[i + 1];
		let name = data.toString('ascii', i + 2, i + size - 1);
		i += size;

		// New animation
		if (type === 1) {
			anim = { name, frames: [] };
			anims.push(anim);
		}
		// Anim frame
		else if (type === 2) {
			anim!.frames.push(name);
		}
	}

	return anims;
}
