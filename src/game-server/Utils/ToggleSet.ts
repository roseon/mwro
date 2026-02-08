/**
 * Same as Set but but with a convenient method to add or
 * delete items by boolean argument.
 */
export class ToggleSet<T> extends Set<T> {
	/**
	 * Either adds or deletes the item.
	 * @param item
	 * @param add
	 */
	public set(item: T, add: boolean): void {
		if (add) this.add(item);
		else this.delete(item);
	}
}
