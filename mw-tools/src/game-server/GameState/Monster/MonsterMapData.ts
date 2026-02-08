import { IndividualMapData, IndividualMapDataJson } from '../Individual/IndividualMapData';
import { GameMap } from '../Map/GameMap';

export class MonsterMapData extends IndividualMapData {
	public override canWalk: boolean = true;

	public constructor(json: IndividualMapDataJson, maps: Map<number, GameMap>) {
		super(json, maps);
	}
}
