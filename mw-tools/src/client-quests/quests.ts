export type ClientQuest = {
	idStart: number;
	idEnd: number;
	name: string;
	level: number;
	description: string;
};

export function readClientQuests(buffer: Buffer): ClientQuest[] {
	let start = 0x11fc40;
	let count = 59;
	let quests: ClientQuest[] = [];

	for (let i = 0; i < count; ++i) {
		let offset = start + i * 376;
		let idStart = buffer.readUInt32LE(offset);
		let idEnd = buffer.readUInt32LE(offset + 4);
		let name = buffer.toString('ascii', offset + 8, offset + 72);
		let level = buffer.readUInt8(offset + 72);
		let description = buffer.toString('ascii', offset + 73, offset + 376);

		name = name.substring(0, name.indexOf('\x00'));
		description = description.substring(0, description.indexOf('\x00'));

		quests.push({ idStart, idEnd, level, name, description });
	}

	return quests;
}
