import { IndividualFightData } from '../Individual/IndividualFightData';

export class PetFightData extends IndividualFightData {
	public lastAction: { type: number; detail: number } | null = null;
	public lastTargetId: number | null = null;
}
