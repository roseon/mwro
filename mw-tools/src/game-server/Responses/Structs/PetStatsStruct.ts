import type { Pet } from '../../GameState/Pet/Pet';
import type { Packet } from '../../PacketBuilder';

export abstract class PetStatsStruct {
	public static readonly size: number = 48;

	/**
	 * Writes the pet stats to the packet.
	 * @param packet
	 * @param offset
	 * @param pet
	 */
	public static write(packet: Packet, offset: number, pet: Pet): void {
		let stats = pet.fightData.stats;
		packet
			.uint32(offset, stats.unused)
			// 4 sta base
			.uint32(offset + 8, stats.hp.points)
			// 12 int base
			.uint32(offset + 16, stats.mp.points)
			// 20 str base
			.uint32(offset + 24, stats.attack.points)
			// 28 agi base
			.uint32(offset + 32, stats.speed.points)
			.float(offset + 36, stats.growthRate)
			.uint16(offset + 40, pet.species)
			.uint16(offset + 42, pet.file)
			.uint8(offset + 44, pet.level.reborn);
	}
}
