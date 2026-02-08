import type {
	BaseItem,
	ItemProperties,
	ItemPropertiesJson,
} from '../../Database/Collections/BaseItem/BaseItemTypes';
import type { EquipmentSlot } from '../../Enums/EquipmentSlot';
import { MapID } from '../../Enums/MapID';
import type { ClientActionContext } from '../../GameActions/GameActionContext';
import type { GameActionExecutable } from '../../GameActions/GameActionExecutable';
import { formatFightStatJson } from '../../Utils/StringUtils';
import type { FightStatJson } from '../Fight/FightStats';
import { Game } from '../Game';
import { ItemType } from './ItemType';

export type ItemJson = {
	id: number;
	count: number;
	itemProperties?: ItemPropertiesJson;
};

export class Item {
	public count: number = 1;

	public locked: boolean = false;

	public price: number = 0;

	public itemProperties: ItemProperties | undefined;

	public get id(): number {
		return this.base.id;
	}

	public get file(): number {
		return this.base.file;
	}

	public get stackLimit(): number {
		return this.base.stackLimit;
	}

	public get name(): string {
		return this.base.name;
	}

	public get description(): string {
		return this.base.description;
	}

	public get type(): ItemType {
		return this.base.type;
	}

	public get equipmentSlot(): EquipmentSlot | null {
		return this.base.equipmentSlot;
	}

	public get action(): GameActionExecutable<ClientActionContext> | null {
		return this.base.action;
	}

	public get questItem(): boolean {
		return this.base.questItem;
	}

	public get stats(): FightStatJson {
		return this.base.stats ?? {};
	}

	public get level(): number {
		return this.base.level ?? 0;
	}

	public get petId(): number | undefined {
		return this.base.petId;
	}

	public get race(): number | undefined {
		return this.base.race;
	}

	public get gender(): number | undefined {
		return this.base.gender;
	}

	public get canConvert(): boolean {
		return this.base.canConvert ?? false;
	}

	public constructor(public base: BaseItem) {}

	public toJson(): ItemJson {
		return {
			id: this.id,
			count: this.count,
			itemProperties: this.itemProperties,
		};
	}

	private getMapName(mapId: number): string {
		return MapID[mapId] || `Unknown Map (${mapId})`;
	}

	public getText(): string {
		let text: string = `#Y${this.name}#N#E${this.description}`;
		if (this.itemProperties?.bindLocation) {
			const loc = this.itemProperties.bindLocation;
			if (!loc.map || !loc.x || !loc.y) {
				text += `#r[Location not set]`;
				return text;
			}
			text += `#y#e[Map: ${this.getMapName(loc.map)}, X: ${loc.x}, Y: ${loc.y}]`;
		}

		if (this.type === ItemType.Equipment) {
			const reqLevel = this.level;
			text += `#w#e[Required Level: ${reqLevel}]`;
			text += `#w#e[Required Class: ${this.classString()}]#n#e`;
		}

		if (this.itemProperties?.gems) {
			let slots: string[] = [];
			if (this.itemProperties.gems.length > 0) {
				for (let gem of this.itemProperties.gems) {
					slots.push(formatFightStatJson(gem.stats).join(', '));
				}
			}

			text += `#y#e${slots.join(', ')}`;
		}

		return text;
	}

	public classString(): string {
		if (this.race === undefined) return '';
		const raceNames = ['Human', 'Centaur', 'Mage', 'Borg'];
		const genderStr = this.gender === 1 ? 'Female' : 'Male';
		return `${raceNames[this.race]} ${genderStr}`;
	}
}
