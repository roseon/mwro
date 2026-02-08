import type { IndividualFightData } from './IndividualFightData';
import type { IndividualMapData } from './IndividualMapData';

export type IndividualJson = {
	id: number;
	name: string;
	file: number;
};

export abstract class Individual {
	public id: number;

	public name: string;

	public file: number;

	public abstract mapData: IndividualMapData | null;

	public abstract fightData: IndividualFightData | null;

	public constructor(json: IndividualJson) {
		this.id = json.id;
		this.name = json.name;
		this.file = json.file;
	}
}
