import type { Fight } from '../Fight/Fight';
import { IndividualFightData } from '../Individual/IndividualFightData';

export class PlayerFightData extends IndividualFightData {
	public currentFight: Fight | null = null;
	public lastAction: { type: number; detail: number } | null = null;
	public lastTargetId: number | null = null;
	public autoEnabled: boolean = false;
	public autoCommandReceived: boolean = false;
}
