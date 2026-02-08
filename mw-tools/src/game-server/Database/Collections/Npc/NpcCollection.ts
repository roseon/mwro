import { BaseCollection } from '../BaseCollection';
import type { NpcJson } from './NpcJson';

export class NpcCollection extends BaseCollection<NpcJson, NpcJson> {
	private static instance: NpcCollection | null = null;

	protected constructor() {
		super('Npc');
	}

	public static getInstance(): NpcCollection {
		if (this.instance === null) this.instance = new NpcCollection();

		return this.instance;
	}

	public getKey(obj: NpcJson): string {
		return obj.id.toString();
	}

	protected toJson(): NpcJson {
		// Would this ever be needed?
		throw Error('Saving NPCs is not supported.');
	}

	protected fromJson(json: NpcJson): NpcJson {
		return json;
	}
}
