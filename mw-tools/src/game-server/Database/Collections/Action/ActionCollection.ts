import type { GameActionExecutable } from '../../../GameActions/GameActionExecutable';
import { GameActionParser } from '../../../GameActions/GameActionParser';
import type { GameAction } from '../../../GameActions/GameActionTypes';
import { BaseCollection } from '../BaseCollection';

export type GameActionWithId = {
	id: string;
	action: GameAction;
};

export type GameActionExecutableWithId = {
	id: string;
	action: GameActionExecutable<unknown>;
};

export class ActionCollection extends BaseCollection<GameActionExecutableWithId, GameActionWithId> {
	private static instance: ActionCollection | null = null;

	protected constructor() {
		super('Action');
	}

	public static getInstance(): ActionCollection {
		if (this.instance === null) this.instance = new ActionCollection();

		return this.instance;
	}

	public getKey(): never {
		throw Error("Can't save executables to the db.");
	}

	protected toJson(): never {
		throw Error("Can't save executables to the db.");
	}

	protected fromJson(json: GameActionWithId): GameActionExecutableWithId {
		return {
			id: json.id,
			action: GameActionParser.parse(json.action),
		};
	}
}
