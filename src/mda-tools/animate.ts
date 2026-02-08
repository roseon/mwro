import { existsSync, mkdirSync, readFileSync } from 'fs';
import sharp from 'sharp';
import type { PixelData } from './image';
import { imageOverlay } from './image';
import { isMDA, parseAnimData, readMda } from './mda';
import type { PixelDataRays } from './rays';
import { isRaysImageFile, parseRaysImage } from './rays';
import { findAllFiles } from './util';

let searchPath = 'client';
let dest = 'output/anim';

/**
 * Calculate the size needed to put any of the images in it.
 * @param data
 */
function getDestinationSize(data: PixelDataRays[]): {
	w: number;
	h: number;
	cx: number;
	cy: number;
} {
	let l = 0,
		r = 0,
		t = 0,
		b = 0;

	for (let pd of data) {
		if (pd.centerX > l) l = pd.centerX;
		if (pd.width - pd.centerX > r) r = pd.width - pd.centerX;
		if (pd.centerY > t) t = pd.centerY;
		if (pd.height - pd.centerY > b) b = pd.height - pd.centerY;
	}

	return { w: l + r, h: t + b, cx: l, cy: t };
}

// Find all mda files
let mdas = findAllFiles(searchPath).filter(p => p.substring(p.length - 4).toLowerCase() === '.mda');

(async () => {
	for (let mda of mdas) {
		let mdaDest = dest + '/' + mda.substring(searchPath.length);

		// Skip MDAs that are already done
		if (existsSync(mdaDest)) {
			console.log('Skipping ' + mda);
			continue;
		}

		let fileContents = readFileSync(mda);
		if (!isMDA(fileContents)) continue;

		let mdaData = readMda(fileContents);
		if (mdaData.animFrames === 0) continue;

		console.log('Converting ' + mda);
		mkdirSync(mdaDest, { recursive: true });

		let anims = parseAnimData(mdaData.animData);
		let images = new Map<string, PixelDataRays>();

		// Load images
		for (let mdaItem of mdaData.files) {
			if (!isRaysImageFile(mdaItem.contents)) continue;

			let pixelData = parseRaysImage(mdaItem.contents);

			if (pixelData !== null) images.set(mdaItem.name, pixelData);
		}

		// Create animations
		for (let anim of anims) {
			if (anim.frames.length === 0) continue;

			let frames = anim.frames.map(name => images.get(name)!);
			let size = getDestinationSize(frames);

			let combined: PixelData = {
				width: size.w,
				height: size.h,
				data: Buffer.alloc(size.w * size.h * frames.length * 4),
			};

			// Put all images below each other
			for (let i = 0; i < frames.length; ++i) {
				let left = size.cx - frames[i].centerX;
				let top = size.cy - frames[i].centerY + i * size.h;
				imageOverlay(frames[i], combined, left, top);
			}

			// Save as webp
			await sharp(combined.data, {
				raw: {
					width: size.w,
					height: size.h * frames.length,
					channels: 4,
				},
			})
				.webp({ pageHeight: size.h } as sharp.WebpOptions)
				.toFile(mdaDest + '/' + anim.name + '.webp');
		}
	}
})();
