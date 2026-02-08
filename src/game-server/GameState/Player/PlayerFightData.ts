import type { Fight } from '../Fight/Fight';
import { IndividualFightData } from '../Individual/IndividualFightData';

export class PlayerFightData extends IndividualFightData {
	public currentFight: Fight | null = null;
}
