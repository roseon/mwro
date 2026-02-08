import { BaseCollection } from '../BaseCollection';
import type { BasePet, BasePetJson } from './BasePetTypes';

export class BasePetCollection extends BaseCollection<BasePet, BasePetJson> {
	private static instance: BasePetCollection | null = null;

	protected constructor() {
		super('BasePet');
	}

	public static getInstance(): BasePetCollection {
		if (this.instance === null) this.instance = new BasePetCollection();

		return this.instance;
	}

	public getKey(obj: BasePet): string {
		return obj.key ?? obj.petId?.toString() ?? obj.name;
	}

	protected toJson(obj: BasePet): BasePetJson {
		return obj;
	}

	protected fromJson(json: BasePetJson): BasePet {
		return json;
	}
}
