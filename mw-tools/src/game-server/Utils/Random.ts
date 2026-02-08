export type RandomJson = {
	int?: boolean;
	min: number;
	max: number;
};

export class Random {
	/**
	 * Has the given chance on returning true.
	 * @param chance between 0 and 1
	 */
	public static chance(chance: number): boolean {
		return Math.random() < chance;
	}

	/**
	 * Returns a non-rounded number between the min and max.
	 * Includes the min, excludes the max.
	 * @param min
	 * @param max
	 */
	public static number(min: number, max: number): number {
		return min + Math.random() * (max - min);
	}

	/**
	 * Returns a random integer between the min and max.
	 * Includes the min, excludes the max.
	 * @param min
	 * @param max
	 */
	public static int(min: number, max: number): number {
		return Math.floor(this.number(Math.floor(min), Math.floor(max)));
	}

	/**
	 * Returns a random integer between min and max.
	 * Includes both min and max.
	 * @param min
	 * @param max
	 */
	public static intInclusive(min: number, max: number): number {
		return this.int(min, max + 1);
	}

	/**
	 * Returns a random number based on the object.
	 * For convenience (with `number | RandomJson` being used),
	 * if a number is passed, the same number is returned.
	 * @param json
	 */
	public static fromJson(json: RandomJson | number): number {
		if (typeof json === 'number') return json;

		if (json.int) return this.int(json.min, json.max);
		else return this.number(json.min, json.max);
	}
}
