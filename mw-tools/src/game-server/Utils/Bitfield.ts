/**
 * Number wrapper with helper functions to set bits.
 */
export class Bitfield {
	public constructor(public value: number) {}

	/**
	 * Check if the value has all of the flags.
	 * @param flag
	 */
	public has(flag: number): boolean {
		return (this.value & flag) === flag;
	}

	/**
	 * Check if the value has any of the flags.
	 * @param flag
	 */
	public any(flag: number): boolean {
		return (this.value & flag) !== 0;
	}

	/**
	 * Add the flag to the value.
	 * @param flag
	 */
	public add(flag: number): void {
		this.value |= flag;
	}

	/**
	 * Remove the flag from the value.
	 * @param flag
	 */
	public remove(flag: number): void {
		this.value &= ~flag;
	}
}
