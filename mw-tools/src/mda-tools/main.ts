import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { isJPG, pixelDataToPNG } from './image';
import { isMDA, readMda } from './mda';
import { isRaysImageFile, parseRaysImage } from './rays';
import { isRiff } from './riff';
import { findAllFiles } from './util';

/* TODO:
 * Getting text files out of mda isn't working.
 */

let searchPath = 'client';
let dest = 'output/mda';

(async () => {
	// Find all mda files
	let mdas = findAllFiles(searchPath).filter(
		p => p.substring(p.length - 4).toLowerCase() === '.mda',
	);

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

		mkdirSync(mdaDest, { recursive: true });
		console.log('Converting ' + mda);

		for (let file of mdaData.files) {
			let name = file.name.replace(/[<>:"/\\|?*]+/g, '');
			let data: Buffer | null = null;

			// Find the filetype
			if (isRaysImageFile(file.contents)) {
				let pData = parseRaysImage(file.contents);

				if (!pData) continue;

				data = await pixelDataToPNG(pData);
				name += '.png';
			} else if (isRiff(file.contents)) {
				data = file.contents;
				name += '.wav';
			} else if (isJPG(file.contents)) {
				data = file.contents;
				name += '.jpg';
			} else {
				data = file.contents;
				name = '.txt';
			}

			let path = mdaDest + '/' + name;

			// Avoid duplicate names
			if (existsSync(path))
				path =
					path.substring(0, path.length - 4) +
					'_' +
					String(Math.random()).substring(2) +
					path.substring(path.length - 4);

			writeFileSync(path, data);
		}
	}
})();
