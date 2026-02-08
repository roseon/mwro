import { Random } from '../../Utils/Random';

export type BaseStats = {
	sta: number;
	int: number;
	str: number;
	agi: number;
};

export type StatRates = BaseStats & {
	growthRate: number;
};

export type RandomStatRates = {
	sta: { min: number; max: number };
	int: { min: number; max: number };
	str: { min: number; max: number };
	agi: { min: number; max: number };
	growthRate: { min: number; max: number };
};

/**
 * Creates stat rates based on the random values.
 * @param rates
 */
export function resolveRandomStatRates(rates: RandomStatRates): StatRates {
	return {
		sta: Random.intInclusive(rates.sta.min, rates.sta.max),
		int: Random.intInclusive(rates.int.min, rates.int.max),
		str: Random.intInclusive(rates.str.min, rates.str.max),
		agi: Random.intInclusive(rates.agi.min, rates.agi.max),
		growthRate:
			Random.intInclusive(rates.growthRate.min * 1000, rates.growthRate.max * 1000) / 1000,
	};
}
