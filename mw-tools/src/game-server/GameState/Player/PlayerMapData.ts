import type { IndividualMapDataJson } from '../Individual/IndividualMapData';
import { IndividualMapData } from '../Individual/IndividualMapData';
import type { GameMap } from '../Map/GameMap';

export class PlayerMapData extends IndividualMapData {
	public constructor(json: IndividualMapDataJson, maps: Map<number, GameMap>) {
		super(json, maps);
	}
}
