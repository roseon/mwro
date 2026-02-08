import type { Packet } from '../../PacketBuilder';

export type FightStatusResult = {
	id: number;
	status: number;
	hp: number;
};

export abstract class FightStatusResultStruct {
	public static readonly size: number = 12;

	public static write(packet: Packet, offset: number, result: FightStatusResult): void {
		packet
			.uint32(offset, result.id)
			.uint32(offset + 4, result.status)
			.int32(offset + 8, result.hp);
	}
}
