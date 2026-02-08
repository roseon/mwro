import { ConditionCollection } from '../Database/Collections/Condition/ConditionCollection';
import type { GameConditionExecutable } from './GameConditionExecutable';

export class GameConditionCache {
	private static instance: GameConditionCache | null = null;
	public readonly ready: Promise<void>;
	private map: Map<string, GameConditionExecutable<unknown>> = new Map();

	private constructor() {
		this.ready = this.init();
	}

	public static getInstance(): GameConditionCache {
		if (this.instance === null) this.instance = new GameConditionCache();

		return this.instance;
	}

	public get(id: string): GameConditionExecutable<unknown> | null {
		return this.map.get(id) ?? null;
	}

	private async init(): Promise<void> {
		let conditions = await ConditionCollection.getInstance().getAll();
		conditions.forEach(({ id, condition }) => this.map.set(id, condition));
	}
}
