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
			id = await userCollection.maxPetKey();

			if (id == 0) id = 0xc0000001;
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
		let tempPet = new Pet({
			id: pet.id,
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
		tempPet.loyalty = pet.loyalty;
		tempPet.skillList = pet.skillList;

		return tempPet;
	}
}
