import { GameActionParser } from '../../../GameActions/GameActionParser';
import { BaseCollection } from '../BaseCollection';
import type { BaseItem, BaseItemJson } from './BaseItemTypes';

export class BaseItemCollection extends BaseCollection<BaseItem, BaseItemJson> {
	private static instance: BaseItemCollection | null = null;

	protected constructor() {
		super('BaseItem');
	}

	public static getInstance(): BaseItemCollection {
		if (this.instance === null) this.instance = new BaseItemCollection();

		return this.instance;
	}

	public getKey(obj: BaseItem): string {
		return obj.id.toString();
	}

	protected toJson(): never {
		throw Error('Not implemented: converting BaseItem to json.');
	}

	protected fromJson(json: BaseItemJson): BaseItem {
		return {
			...json,
			equipmentSlot: json.equipmentSlot ?? null,
			questItem: json.questItem ?? false,
			action: json.action ? GameActionParser.parse(json.action) : null,
		};
	}
}
