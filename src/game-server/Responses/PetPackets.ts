import type { Pet } from '../GameState/Pet/Pet';
import type { Player } from '../GameState/Player/Player';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import { AttrsStruct } from './Structs/AttrsStruct';
import { ExpStruct } from './Structs/ExpStruct';
import { PetStatsStruct } from './Structs/PetStatsStruct';
import { PetStruct } from './Structs/PetStruct';
import { ResistStruct } from './Structs/ResistStruct';

export abstract class PetPackets {
	/**
	 * Contains the players pets.
	 * @param pets
	 */
	public static list(pets: Pet[]): Packet {
		let packet = new Packet(16 + pets.length * PetStruct.size, PacketType.PetList).uint32(
			12,
			pets.length,
		);

		for (let i = 0; i < pets.length; ++i)
			packet.struct(16 + i * PetStruct.size, PetStruct, pets[i]);

		return packet;
	}

	/**
	 * The result of the player changing the pet's name.
	 * @param pet
	 * @param success
	 */
	public static rename(pet: Pet, success: boolean = true): Packet {
		return new Packet(20, PacketType.PetRename).int32(12, success ? 0 : -1).uint32(16, pet.id);
	}

	/**
	 * The result of using the pet's stat points.
	 * @param pet
	 */
	public static useStats(pet: Pet): Packet {
		return new Packet(16 + AttrsStruct.size + ExpStruct.size, PacketType.PetUseStats)
			.uint16(6, AttrsStruct.size + ExpStruct.size)
			.uint32(12, pet.id)
			.struct(16, AttrsStruct, pet)
			.struct(16 + AttrsStruct.size, ExpStruct, pet.level);
	}

	/**
	 * Used when pet level changes, updates stats, exp.
	 * @param pet
	 */
	public static level(pet: Pet): Packet {
		return new Packet(104, PacketType.PetLevel)
			.uint16(6, 88)
			.uint32(12, pet.id)
			.struct(16, PetStatsStruct, pet)
			.struct(64, AttrsStruct, pet)
			.struct(92, ExpStruct, pet.level);
	}

	/**
	 * Used when pet exp changes.
	 * @param pet
	 */
	public static experience(pet: Pet): Packet {
		return new Packet(16 + ExpStruct.size, PacketType.PetExperience)
			.uint16(6, ExpStruct.size)
			.uint32(12, pet.id)
			.struct(16, ExpStruct, pet.level);
	}

	/**
	 * Set a pet on follow.
	 * @param pet
	 * @param owner
	 */
	public static follow(pet: Pet, owner: Player): Packet {
		return new Packet(44, PacketType.PetFollow)
			.uint32(12, owner.id)
			.uint32(16, pet.id)
			.uint32(20, owner.id)
			.uint16(24, pet.file)
			.uint8(26, pet.level.reborn)
			.string(28, pet.name, 14);
	}

	/**
	 * Unset a pet from following.
	 * @param pet
	 */
	public static unfollow(pet: Pet): Packet {
		return new Packet(16, PacketType.PetUnfollow).uint32(12, pet.id);
	}

	/**
	 * Set a pet as active.
	 * @param pet
	 */
	public static battle(pet: Pet): Packet {
		return new Packet(16, PacketType.PetBattle).uint32(12, pet.id);
	}

	/**
	 * Set a pet as inactive.
	 * @param pet
	 */
	public static unbattle(pet: Pet): Packet {
		return new Packet(16, PacketType.PetUnbattle).uint32(12, pet.id);
	}

	/**
	 * Add a pet to the player.
	 * @param pet
	 */
	public static add(pet: Pet): Packet {
		return new Packet(16 + PetStruct.size + ResistStruct.size, PacketType.PetAdd)
			.uint16(6, PetStruct.size + ResistStruct.size)
			.uint32(12, 1)
			.struct(16, PetStruct, pet)
			.struct(16 + PetStruct.size, ResistStruct, pet.fightData.resist);
	}

	/**
	 * Remove a pet from the player.
	 * @param id
	 */
	public static remove(id: number): Packet {
		return new Packet(20, PacketType.PetRemove).uint32(16, id);
	}

	/**
	 * Updates the pet's resist data.
	 * @param pets
	 */
	public static resist(pet: Pet): Packet {
		return new Packet(16 + ResistStruct.size, PacketType.PetResist)
			.uint32(12, pet.id)
			.struct(16, ResistStruct, pet.fightData.resist);
	}

	/**
	 * Update the pet's stats.
	 * @param pet
	 */
	public static stats(pet: Pet): Packet {
		return new Packet(16 + PetStatsStruct.size, PacketType.PetStats)
			.uint16(6, PetStatsStruct.size)
			.struct(16, PetStatsStruct, pet);
	}

	/**
	 * Update the pet's attributes.
	 * @param pet
	 */
	public static attributes(pet: Pet): Packet {
		return new Packet(16 + AttrsStruct.size + ExpStruct.size, PacketType.PetAttributes)
			.uint16(6, AttrsStruct.size + ExpStruct.size)
			.struct(16, AttrsStruct, pet)
			.struct(16 + AttrsStruct.size, ExpStruct, pet.level);
	}

	/**
	 * Updates the pet's skill data.
	 * @param pet
	 */
	public static skills(pet: Pet): Packet {
		let skills = pet.fightData.skills.skillData;
		let packet = new Packet(16 + skills.length * 4, PacketType.PetSkills).uint32(
			12,
			skills.length,
		);

		for (let i = 0; i < skills.length; ++i) packet.uint16(16 + i * 4, skills[i].id);

		return packet;
	}

	/**
	 * Updates the active pet's hp, will show an animation.
	 * @param pet
	 */
	public static healHp(pet: Pet): Packet {
		return new Packet(20, PacketType.PetHealHp)
			.uint32(12, pet.fightData.stats.currentHp)
			.uint32(16, pet.id);
	}

	/**
	 * Updates the active pet's mp, will show an animation.
	 * @param pet
	 */
	public static healMp(pet: Pet): Packet {
		return new Packet(20, PacketType.PetHealMp)
			.uint32(12, pet.fightData.stats.currentMp)
			.uint32(16, pet.id);
	}

	/**
	 * Send the text of a pet's info.
	 * @param pet
	 */
	public static petInfo(pet: Pet): Packet {
		let text = pet.getText();
		let res = pet.getResAboveZero();
		let packet = new Packet(16 + text.length + res.length + 1, PacketType.ItemInfo)
			.string(16, text)
			.string(16 + text.length, res);
		return packet;
	}
}
