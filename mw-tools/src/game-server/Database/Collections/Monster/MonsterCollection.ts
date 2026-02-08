import { BaseCollection } from '../BaseCollection';
import type { MonsterInstanceJson } from './MonsterInstanceJson';

export class MonsterCollection extends BaseCollection<MonsterInstanceJson, MonsterInstanceJson> {
	private static instance: MonsterCollection | null = null;

	protected constructor() {
		super('Monster');
	}

	public static getInstance(): MonsterCollection {
		if (this.instance === null) this.instance = new MonsterCollection();

		return this.instance;
	}

	public getKey(obj: MonsterInstanceJson): string {
		return obj.id.toString();
	}

	protected toJson(): MonsterInstanceJson {
		throw Error('Saving Monsters is not supported.');
	}

	protected fromJson(json: MonsterInstanceJson): MonsterInstanceJson {
		return json;
	}
}
