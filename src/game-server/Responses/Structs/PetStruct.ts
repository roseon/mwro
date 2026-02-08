import type { Pet } from '../../GameState/Pet/Pet';
import type { Packet } from '../../PacketBuilder';
import { AttrsStruct } from './AttrsStruct';
import { ExpStruct } from './ExpStruct';
import { PetStatsStruct } from './PetStatsStruct';

export abstract class PetStruct {
	public static readonly size: number = 116;

	/**
	 * Write pet data to the packet.
	 * @param packet
	 * @param offset
	 * @param pet
	 */
	public static write(packet: Packet, offset: number, pet: Pet): void {
		packet
			.uint32(offset, pet.id)
			.string(offset + 4, pet.name, 14)
			.uint32(offset + 20, pet.loyalty)
			.uint32(offset + 24, pet.intimacy)
			.struct(offset + 28, AttrsStruct, pet)
			.struct(offset + 56, ExpStruct, pet.level)
			.struct(offset + 68, PetStatsStruct, pet);
	}
}
