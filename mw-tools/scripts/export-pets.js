const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, '..', 'build', 'game-server', 'Data', 'PetTemplates.js');
const { petTemplates } = require(templatesPath);

const playerDir = path.join(
	__dirname,
	'..',
	'build',
	'game-server',
	'file-storage',
	'MythWarServer',
	'_default',
	'Player',
);

const templateList = Object.values(petTemplates).filter(
	pet => pet && typeof pet.name === 'string' && typeof pet.petId === 'number',
);

const templateByName = new Map(
	templateList.map(pet => [pet.name.toLowerCase(), pet]),
);
const templateByFile = new Map(templateList.map(pet => [pet.file, pet]));

const runtimePets = new Map();

if (fs.existsSync(playerDir)) {
	for (const file of fs.readdirSync(playerDir)) {
		if (!file.endsWith('.json')) continue;
		const playerJson = JSON.parse(
			fs.readFileSync(path.join(playerDir, file), 'utf8'),
		);
		if (!Array.isArray(playerJson.pets)) continue;
		for (const pet of playerJson.pets) {
			if (!pet || typeof pet.id !== 'number') continue;
			if (runtimePets.has(pet.id)) continue;
			const template =
				templateByName.get(String(pet.baseName ?? pet.name).toLowerCase()) ||
				templateByFile.get(pet.file);
			runtimePets.set(pet.id, {
				petId: template?.petId ?? '',
				name: template?.name ?? pet.baseName ?? pet.name ?? '',
			});
		}
	}
}

const runtimeLines = Array.from(runtimePets.entries())
	.sort((a, b) => a[0] - b[0])
	.map(([runtimeId, data]) => `${runtimeId}\t${data.petId}\t${data.name}`);

const templateLines = templateList
	.sort((a, b) => a.petId - b.petId)
	.map(pet => `\t${pet.petId}\t${pet.name}`);

const lines = [
	'# runtimeId\tpetId\tname',
	...runtimeLines,
	'',
	'# runtimeId is blank for templates without a runtime instance',
	...templateLines,
];

const outputPath = path.join(__dirname, '..', 'pet-list.txt');
fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${runtimeLines.length} runtime pets and ${templateLines.length} templates to ${outputPath}`);
