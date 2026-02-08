import { endAtZero } from '../game-server/Utils/StringUtils';

export type ClientSkill = {
	name: string;
	description: string;
	effect: number;
	mp: number;
	mpAdd: number;
	rounds: number;
	targets: number;
	enemy: boolean;
	mda: number;
	ani: number;
};

export function readClientSkills(buffer: Buffer): ClientSkill[] {
	let start = 0x001ba140;
	let count = 84;
	let size = 104;
	let skills: ClientSkill[] = [];

	for (let i = 0; i < count; ++i) {
		let offset = start + i * size;

		skills.push({
			name: endAtZero(buffer.toString('ascii', offset, offset + 16)),
			description: endAtZero(buffer.toString('ascii', offset + 17, offset + 78)),
			effect: buffer.readUInt16LE(offset + 78),
			mp: buffer.readUInt32LE(offset + 80),
			mpAdd: Math.round(buffer.readFloatLE(offset + 84) * 10000) / 10000,
			rounds: buffer.readUInt16LE(offset + 88),
			targets: buffer.readUInt16LE(offset + 90),
			enemy: buffer.readUInt16LE(offset + 92) === 1,
			mda: buffer.readUInt16LE(offset + 100),
			ani: buffer.readUInt16LE(offset + 102),
		});
	}

	return skills;
}
