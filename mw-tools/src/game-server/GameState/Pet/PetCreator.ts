import type { PetTemplate } from '../../Data/PetTemplates';
import { PlayerCollection } from '../../Database/Collections/Player/PlayerCollection';
import type { PetJsonCollection } from '../../Database/Collections/Player/PlayerJson';
import { Level } from '../Level';
import { MonsterCreator } from '../Monster/MonsterCreator';
import { eligibleSkills } from '../Skills/Skills';
import { Pet } from './Pet';
import { Resist } from '../Resist';

let id: number | null = null;

/**
 * Class used for creating a new pet.
 */
export abstract class PetCreator {
	public static async create(petTemplate: PetTemplate): Promise<Pet> {
		if (!id) {
			let userCollection = PlayerCollection.getInstance();
			let pets = await userCollection.getAllPets();

			let max = 0;
			for (let pet of pets) {
				const pid = PetCreator.normalizeId(pet.id);
				if (pid > max) max = pid;
			}

			if (max == 0) max = 0x40000000;
			id = max;
		}
		id++;

		let petMonster = MonsterCreator.create(petTemplate);

		let pet = new Pet({
			id: id,
			name: petMonster.name,
			baseName: petMonster.name,
			file: petMonster.file,
			fightData: petMonster.fightData,
		});

		pet.skillList = petTemplate.skills ?? [];
		pet.fightData.stats.healHp();
		pet.fightData.stats.healMp();
		pet.fightData.stats.unused = 4;
		pet.fightData.resist = Object.assign(new Resist(), petTemplate.resist ?? {});
		pet.loyalty = 100;

		return pet;
	}

	public static fromJson(pet: PetJsonCollection): Pet {
		let level = Level.fromExp(pet.totalExp, pet.reborn);
		let id = PetCreator.normalizeId(pet.id);

		let tempPet = new Pet({
			id: id,
			name: pet.name,
			baseName: pet.baseName,
			file: pet.file,
			fightData: {
				stats: pet.stats,
				skills: eligibleSkills(pet.skillList, level.level),
				resist: pet.resist,
			},
		});

		tempPet.level = level;
		const autoMissing = Math.max(0, level.level - 1 - tempPet.fightData.stats.autoLevelsApplied);
		if (autoMissing > 0) {
			tempPet.fightData.stats.updateStatPointsForLevel(autoMissing);
		}
		tempPet.loyalty = pet.loyalty;
		tempPet.skillList = pet.skillList;

		return tempPet;
	}

	/**
	 * Normalizes pet ID to be in a safe range (0x40000000 - 0x5FFFFFFF).
	 * - Avoids collision with Players (low IDs).
	 * - Avoids collision with Monsters (0x80000000+).
	 * - Migrates legacy IDs.
	 */
	private static normalizeId(id: number): number {
		// Migrate legacy small IDs (collide with Players) to 0x40000000 range
		if (id < 0x20000000) {
			return id | 0x40000000;
		}
		// Migrate recent generated IDs (0xC0000000+, collide with Monsters visuals) to 0x50000000 range
		// 0xC0000000 is 3221225472
		if (id >= 0xc0000000) {
			return (id & 0x0fffffff) | 0x50000000;
		}
		return id;
	}
}
