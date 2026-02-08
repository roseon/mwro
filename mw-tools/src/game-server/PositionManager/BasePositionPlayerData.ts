/**
 * 14 bytes per player:
 * uint32 id
 * uint16 map
 * uint16 row
 * uint16 column
 * uint16 destRow
 * uint16 destColumn
 */

import { Point } from '../Utils/Point';

export abstract class BasePositionPlayerData {
	public static readonly maxPlayers: number = 1000;
	protected static readonly playerSize: number = 14;
	protected readonly buffer: Buffer;

	public constructor(shared: SharedArrayBuffer) {
		this.buffer = Buffer.from(shared);
	}

	public static getBufferSize(): number {
		return this.maxPlayers * this.playerSize;
	}

	public setId(index: number, id: number): void {
		this.buffer.writeUInt32LE(id, index * BasePositionPlayerData.playerSize);
	}

	public getId(index: number): number {
		return this.buffer.readUInt32LE(index * BasePositionPlayerData.playerSize);
	}

	public setMap(index: number, map: number): void {
		this.buffer.writeUInt16LE(map, index * BasePositionPlayerData.playerSize + 4);
	}

	public getMap(index: number): number {
		return this.buffer.readUInt16LE(index * BasePositionPlayerData.playerSize + 4);
	}

	public setGridPoint(index: number, point: Point): void {
		this.buffer.writeUInt16LE(point.x, index * BasePositionPlayerData.playerSize + 6);
		this.buffer.writeUInt16LE(point.y, index * BasePositionPlayerData.playerSize + 8);
	}

	public getGridPoint(index: number): Point {
		return new Point(
			this.buffer.readUInt16LE(index * BasePositionPlayerData.playerSize + 6),
			this.buffer.readUInt16LE(index * BasePositionPlayerData.playerSize + 8),
		);
	}

	public setDestGridPoint(index: number, point: Point): void {
		this.buffer.writeUInt16LE(point.x, index * BasePositionPlayerData.playerSize + 10);
		this.buffer.writeUInt16LE(point.y, index * BasePositionPlayerData.playerSize + 12);
	}

	public getDestGridPoint(index: number): Point {
		return new Point(
			this.buffer.readUInt16LE(index * BasePositionPlayerData.playerSize + 10),
			this.buffer.readUInt16LE(index * BasePositionPlayerData.playerSize + 12),
		);
	}
}
