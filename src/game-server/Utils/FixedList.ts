/**
 * Indexed list with fixed length.
 * Null and undefined do not count as values.
 */
export class FixedList<TValue> {
	protected map: Map<number, TValue> = new Map();
	private _maxSize: number;

	/**
	 * Maximum number of items in this list.
	 */
	public get maxSize(): number {
		return this._maxSize;
	}

	/**
	 * Number of items in this list.
	 */
	public get usedSize(): number {
		return this.map.size;
	}

	/**
	 * How many indexes in this list are unused.
	 */
	public get freeSize(): number {
		return this._maxSize - this.map.size;
	}

	public constructor(maxSize: number) {
		this._maxSize = maxSize;
	}

	/**
	 * Remove all items in this list.
	 */
	public clear(): void {
		this.map.clear();
	}

	/**
	 * Delete an item in this list.
	 * @param index
	 */
	public delete(index: number): void {
		this.throwIfOutOfBounds(index);
		this.map.delete(index);
	}

	/**
	 * Get an item in this list or null if it doesn't exist.
	 * @param index
	 */
	public get(index: number): TValue | null {
		this.throwIfOutOfBounds(index);
		return this.map.get(index) ?? null;
	}

	/**
	 * Check if the index is used.
	 * @param index
	 */
	public has(index: number): boolean {
		this.throwIfOutOfBounds(index);
		return this.map.has(index);
	}

	/**
	 * Set the item at the given index.
	 * @param index
	 * @param value
	 */
	public set(index: number, value: TValue | null): void {
		this.throwIfOutOfBounds(index);

		if (value === null || value === undefined) this.map.delete(index);
		else this.map.set(index, value);
	}

	/**
	 * Switch the items of two indexes.
	 * @param source
	 * @param dest
	 */
	public switch(source: number, dest: number): void {
		let srcValue = this.get(source);
		let dstValue = this.get(dest);
		this.set(source, dstValue);
		this.set(dest, srcValue);
	}

	/**
	 * Returns the first empty index, or null if the list is full.
	 */
	public getFreeIndex(): number | null {
		for (let i = 0; i < this._maxSize; ++i) {
			if (!this.has(i)) return i;
		}

		return null;
	}

	/**
	 * Retrieve all non-empty key-value pairs in this list.
	 */
	public entries(): IterableIterator<[number, TValue]> {
		return this.map.entries();
	}

	/**
	 * Retrieve all non-empty keys in this list.
	 */
	public keys(): IterableIterator<number> {
		return this.map.keys();
	}

	/**
	 * Retrieve all non-empty values in this list.
	 */
	public values(): IterableIterator<TValue> {
		return this.map.values();
	}

	/**
	 * Throws an exception if the index is out of bounds.
	 * @param index
	 */
	protected throwIfOutOfBounds(index: number): void {
		if (index < 0 || index >= this._maxSize)
			throw Error(`Index out of bounds: 0 < ${index} < ${this._maxSize}.`);
	}
}
