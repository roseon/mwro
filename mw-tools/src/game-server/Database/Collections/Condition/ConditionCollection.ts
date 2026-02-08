import type { GameConditionExecutable } from '../../../GameActions/GameConditionExecutable';
import { GameConditionParser } from '../../../GameActions/GameConditionParser';
import type { GameCondition } from '../../../GameActions/GameConditionTypes';
import { BaseCollection } from '../BaseCollection';

export type GameConditionWithId = {
	id: string;
	condition: GameCondition;
};

export type GameConditionExecutableWithId = {
	id: string;
	condition: GameConditionExecutable<unknown>;
};

export class ConditionCollection extends BaseCollection<
	GameConditionExecutableWithId,
	GameConditionWithId
> {
	private static instance: ConditionCollection | null = null;

	protected constructor() {
		super('Condition');
	}

	public static getInstance(): ConditionCollection {
		if (this.instance === null) this.instance = new ConditionCollection();

		return this.instance;
	}

	public getKey(): never {
		throw Error("Can't save executables to the db.");
	}

	protected toJson(): never {
		throw Error("Can't save executables to the db.");
	}

	protected fromJson(json: GameConditionWithId): GameConditionExecutableWithId {
		return {
			id: json.id,
			condition: GameConditionParser.parse(json.condition),
		};
	}
}
