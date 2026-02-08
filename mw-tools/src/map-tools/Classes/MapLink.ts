import { endAtZero } from '../../game-server/Utils/StringUtils';
import iconv from 'iconv-lite';

export class MapLink {
	public readonly filename: string;
	public readonly id: number;
	public readonly startX: number;
	public readonly startY: number;
	public readonly endX: number;
	public readonly endY: number;
	public readonly name: string;

	public constructor(file: Buffer, offset: number) {
		this.filename = endAtZero(file.toString('ascii', offset, offset + 0x4f));
		this.id = file.readUInt32LE(offset + 0x50);
		this.startX = file.readUInt32LE(offset + 0x54);
		this.startY = file.readUInt32LE(offset + 0x58);
		this.endX = file.readUInt32LE(offset + 0x5c);
		this.endY = file.readUInt32LE(offset + 0x60);
		this.name = endAtZero(iconv.decode(file.subarray(offset + 0x64, offset + 0xdb), 'GBK'));
	}
}
