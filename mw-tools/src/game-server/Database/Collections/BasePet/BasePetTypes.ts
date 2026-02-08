import type { PetTemplate } from '../../../Data/PetTemplates';

export type BasePetJson = PetTemplate & {
	key?: string;
};

export type BasePet = BasePetJson;
