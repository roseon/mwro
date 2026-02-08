/**
 * Calls the callback either when all items have checked in,
 * or when the timeout is reached.
 */
export class TimedWaiter<T> {
	private done: boolean = false;
	private timeout: NodeJS.Timeout;
	private waitForAll: Set<T>;

	public constructor(private callback: () => void, waitForAll: Set<T>, timeout: number) {
		this.waitForAll = new Set(waitForAll);
		this.timeout = setTimeout(() => this.onTimeout(), timeout);
	}

	public isDone(): boolean {
		return this.done;
	}

	public check(item: T): void {
		if (this.done || !this.waitForAll.has(item)) return;

		this.waitForAll.delete(item);

		if (this.waitForAll.size === 0) {
			clearTimeout(this.timeout);
			this.done = true;
			this.callback();
		}
	}

	private onTimeout(): void {
		this.done = true;
		this.callback();
	}
}
