import { ActionCollection } from '../Database/Collections/Action/ActionCollection';
import type { GameActionExecutable } from './GameActionExecutable';

export class GameActionCache {
	private static instance: GameActionCache | null = null;
	public readonly ready: Promise<void>;
	private map: Map<string, GameActionExecutable<unknown>> = new Map();

	private constructor() {
		this.ready = this.init();
	}

	public static getInstance(): GameActionCache {
		if (this.instance === null) this.instance = new GameActionCache();

		return this.instance;
	}

	public get(id: string): GameActionExecutable<unknown> | null {
		return this.map.get(id) ?? null;
	}

	private async init(): Promise<void> {
		let actions = await ActionCollection.getInstance().getAll();
		actions.forEach(({ id, action }) => this.map.set(id, action));
	}
}
