/**
 * Priority queue implemented using a binary min-heap.
 */
export class PriorityQueue<T> {
	private list: T[] = [];

	public constructor(private getValue: (item: T) => number) {}

	/**
	 * Number of items in the queue.
	 */
	public size(): number {
		return this.list.length;
	}

	/**
	 * Whether or not the queue is empty.
	 */
	public isEmpty(): boolean {
		return this.list.length === 0;
	}

	/**
	 * Returns all items in the queue in no particular order.
	 */
	public getAllUnordered(): Readonly<T[]> {
		return this.list;
	}

	/**
	 * Get the first item in the queue without removing it.
	 */
	public peek(): T | null {
		return this.list[0] ?? null;
	}

	/**
	 * Add a new item to the queue.
	 * @param item
	 */
	public push(item: T): void {
		this.list.push(item);
		this.moveTowardsFront(this.list.length - 1);
	}

	/**
	 * Remove and return the item with the lowest value.
	 * Returns null when the queue is empty.
	 */
	public pop(): T | null {
		if (this.list.length <= 2) return this.list.shift() ?? null;

		let result = this.list[0];
		this.list[0] = this.list.pop()!;
		this.moveTowardsBack(0);
		return result;
	}

	/**
	 * Update the position of an item after the value has changed.
	 * @param item
	 */
	public update(item: T): void {
		let index = this.list.indexOf(item);

		if (index === 0) {
			this.moveTowardsBack(index);
			return;
		}

		let value = this.getValue(item);
		let parentIndex = this.getParentIndex(index);
		let parentValue = this.getValue(this.list[parentIndex]);

		if (value < parentValue) this.moveTowardsFront(index);
		else this.moveTowardsBack(index);
	}

	/**
	 * Score has increased so should be popped later.
	 * @param index
	 */
	private moveTowardsBack(index: number): void {
		let item = this.list[index];
		let length = this.list.length;
		let itemIndex = 0;
		let itemValue = this.getValue(item);

		while (true) {
			let leftIndex = this.getLeftChildIndex(itemIndex);

			// No childnodes, nothing left to do
			if (leftIndex >= length) break;

			let leftValue = this.getValue(this.list[leftIndex]);
			let rightIndex = this.getRightChildIndex(itemIndex);

			// No right childnode
			if (rightIndex >= length) {
				// Just compare with left childnode
				if (itemValue > leftValue) this.swap(itemIndex, leftIndex);

				// If there was no right childnode, the left childnode can't have any childnodes
				break;
			}

			let rightValue = this.getValue(this.list[rightIndex]);

			if (leftValue <= rightValue && itemValue > leftValue) {
				this.swap(itemIndex, leftIndex);
				itemIndex = leftIndex;
			} else if (itemValue > rightValue) {
				this.swap(itemIndex, rightIndex);
				itemIndex = rightIndex;
			} else {
				break;
			}
		}
	}

	/**
	 * Finds the item in the list and moves it towards the front if possible.
	 * @param item
	 */
	public moveTowardsFrontObj(item: T): void {
		let index = this.list.indexOf(item);
		this.moveTowardsFront(index);
	}

	/**
	 * Score has gone down and should be popped sooner.
	 * @param index
	 */
	private moveTowardsFront(index: number): void {
		let value = this.getValue(this.list[index]);
		let parentIndex = this.getParentIndex(index);
		let parentValue = this.getValue(this.list[parentIndex]);

		while (index > 0 && parentValue > value) {
			this.swap(index, parentIndex);
			index = parentIndex;
			parentIndex = this.getParentIndex(index);
			parentValue = this.getValue(this.list[parentIndex]);
		}
	}

	/**
	 * Get the index of the left child node.
	 * @param index
	 */
	private getLeftChildIndex(index: number): number {
		return index * 2 + 1;
	}

	/**
	 * Get the index of the right child node.
	 * @param index
	 */
	private getRightChildIndex(index: number): number {
		return (index + 1) * 2;
	}

	/**
	 * Get the index of the parent node.
	 * @param index
	 */
	private getParentIndex(index: number): number {
		// Using ~~ has better performance than Math.trunc
		return ~~((index - 1) / 2);
	}

	/**
	 * Swap the items in two indexes.
	 * @param a
	 * @param b
	 */
	private swap(a: number, b: number): void {
		let c = this.list[a];
		this.list[a] = this.list[b];
		this.list[b] = c;
	}
}
