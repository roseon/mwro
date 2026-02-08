import type { BaseItem, ItemProperties } from '../../Database/Collections/BaseItem/BaseItemTypes';
import { FixedList } from '../../Utils/FixedList';
import type { ItemJson } from './Item';
import { Item } from './Item';

export type ItemContainerJson = {
	slot: number;
	item: ItemJson;
};

/**
 * A container for items. Helps with things like stacking.
 * Used by inventory, banks, and more.
 */

export class ItemContainer extends FixedList<Item> {
	/**
	 * @param maxSize How many slots does this container have.
	 */
	public constructor(maxSize: number) {
		super(maxSize);
	}

	/**
	 * Add item to a slot.
	 * Will throw an error if slot is in use and override is false.
	 * @override
	 * @param slot
	 * @param item
	 * @param override
	 */
	public override set(index: number, item: Item, override: boolean = false): void {
		if (!override && this.has(index)) throw Error('Cannot put item in used slot.');

		super.set(index, item);
	}

	/**
	 * Get the number of items.
	 * Not the same as slots due to stacking.
	 * @param baseItemId
	 * @param excludeLocked exclude locked items from the count
	 */
	public getItemCount(baseItemId: number, excludeLocked: boolean = false): number {
		let count = 0;

		for (let item of this.values()) {
			if (item.base.id !== baseItemId || (excludeLocked && item.locked)) continue;

			count += item.count;
		}

		return count;
	}

	/**
	 * Check if the container has space for the given number of items.
	 * Excludes stacking to locked items.
	 * @param baseItem
	 * @param count
	 */
	public hasSpaceFor(baseItem: BaseItem, count: number): boolean {
		for (let i = 0; i < this.maxSize; ++i) {
			let item = this.get(i);

			if (item === null) count -= baseItem.stackLimit;
			else if (item.id === baseItem.id && !item.locked)
				count -= baseItem.stackLimit - item.count;

			if (count <= 0) return true;
		}

		return false;
	}

	/**
	 * Add the given number of items to the container.
	 * Stacks to items of the same base id first.
	 * @param baseItem
	 * @param count
	 * @returns changed entries
	 */
	public addItem(baseItem: BaseItem, count: number = 1): [index: number, item: Item][] {
		let changed: [number, Item][] = [];

		// First add to existing stacks
		if (baseItem.stackLimit > 1) {
			for (let [slot, item] of this.entries()) {
				if (item.id !== baseItem.id || item.locked) continue;

				let toAdd = Math.min(baseItem.stackLimit - item.count, count);

				if (toAdd <= 0) continue;

				item.count += toAdd;
				count -= toAdd;
				changed.push([slot, item]);

				if (count <= 0) return changed;
			}
		}

		// Fill up empty slots
		for (let i = 0; i < this.maxSize; ++i) {
			if (this.has(i)) continue;

			let item = new Item(baseItem);
			if (baseItem.itemProperties) {
				item.itemProperties = { ...baseItem.itemProperties } as ItemProperties;
			}
			item.count = Math.min(baseItem.stackLimit, count);
			this.set(i, item);
			count -= item.count;
			changed.push([i, item]);

			if (count <= 0) break;
		}

		return changed;
	}

	/**
	 * Removes the first item(s) in the list with this baseItemId.
	 * Does not remove locked items.
	 * @param baseItemId
	 * @param count
	 * @returns changed entries
	 */
	public removeItem(baseItemId: number, count: number = 1): [index: number, item: Item | null][] {
		let changed: [number, Item | null][] = [];

		if (this.getItemCount(baseItemId, true) < count) throw Error('Not enough items to remove.');

		for (let [slot, item] of this.entries()) {
			if (item.base.id !== baseItemId || item.locked) continue;

			let toRemove = Math.min(item.count, count);
			item.count -= toRemove;
			count -= toRemove;

			if (item.count <= 0) {
				this.delete(slot);
				changed.push([slot, null]);
			} else {
				changed.push([slot, item]);
			}

			if (count <= 0) break;
		}

		return changed;
	}

	/**
	 * Moves item from source to destination index, restacks when possible.
	 * With different items, it switches them around.
	 * Ignores item locks.
	 * @param srcIndex
	 * @param dstIndex
	 * @returns changed entries
	 */
	public moveItem(srcIndex: number, dstIndex: number): [index: number, item: Item | null][] {
		let src = this.get(srcIndex);

		if (src === null) return [];

		let dst = this.get(dstIndex)!;

		// Destination slot is empty
		if (dst === null) {
			this.delete(srcIndex);
			this.set(dstIndex, src);
		}
		// Destination slot has item
		else {
			if (dst.id === src.id && dst.count < dst.stackLimit) {
				// Restack items
				let toMove = Math.min(src.count, dst.stackLimit - dst.count);
				dst.count += toMove;
				src.count -= toMove;

				if (src.count === 0) this.delete(srcIndex);
			} else {
				// Different items, swap them
				this.set(dstIndex, src, true);
				this.set(srcIndex, dst, true);
			}
		}

		return [
			[srcIndex, this.get(srcIndex)],
			[dstIndex, this.get(dstIndex)],
		];
	}

	/**
	 * Returns an array of all non-null items in the container.
	 */
	public toArray(): Item[] {
		return Array.from(this.values()).filter((item): item is Item => item !== null);
	}

	public toJson(): ItemContainerJson[] {
		const result: ItemContainerJson[] = [];

		for (let i = 0; i < this.maxSize; i++) {
			const item = this.get(i);
			if (!item) {
				continue;
			}

			result.push({
				slot: i,
				item: item.toJson(),
			});
		}

		return result;
	}

	/**
	 * Recreate item container from json
	 */
	public static fromJson(
		json: ItemContainerJson[],
		maxSize: number,
		baseItems: Map<number, BaseItem>,
	): ItemContainer {
		const container = new ItemContainer(maxSize);

		for (const { slot, item } of json) {
			const baseItem = baseItems.get(item.id);
			if (!baseItem) {
				continue;
			}

			// Create a fresh Item instance (using your existing Item class).
			const tempItem = new Item(baseItem);
			tempItem.count = item.count;
			if (item.itemProperties) {
				tempItem.itemProperties = item.itemProperties;
			}

			// Now place it into the correct slot. Use override = true so that
			// we don’t accidentally “slot occupied” errors. (At deserialization time,
			// we assume the JSON was valid and did not overlap.)
			container.set(slot, tempItem, true);
		}

		return container;
	}
}
