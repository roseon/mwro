import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionAddItemProps } from '../GameActionTypes';
import { MessagePackets } from '../../Responses/MessagePackets';
import { Logger } from '../../Logger/Logger';

/**
 * Add properties to a specific item instance.
 * This allows for unique properties on individual items, like bound locations.
 */
export class AddItemPropsExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionAddItemProps) {
		super(action);
	}

	public static parse(action: GameActionAddItemProps): AddItemPropsExecutable {
		return new this(action);
	}

	protected run({ player }: ClientActionContext): void {
		// Get the item from the last used item index
		const slot = player.memory.lastItemUsedIndex;

		Logger.debug(
			`AddItemPropsExecutable: Adding properties to item at slot ${slot}`,
			this.action.properties,
		);

		if (slot === null) {
			return;
		}

		const item = player.items.inventory.get(slot);

		if (!item) {
			return;
		}

		if (item.itemProperties) {
			Logger.debug(
				`AddItemPropsExecutable: Item ${item.name} already has properties, skipping.`,
				item.itemProperties,
			);
			return;
		}

		// Update the item's properties
		if (this.action.properties.bindLocation) {
			Logger.debug(
				`AddItemPropsExecutable: Binding item ${item.name} to location ${player.mapData.map.id}, ${player.mapData.point.toGridPoint()}`,
			);
			item.itemProperties = {
				bindLocation: {
					map: player.mapData.map.id,
					x: player.mapData.point.toGridPoint().x,
					y: player.mapData.point.toGridPoint().y,
				},
			};
			player.client?.write(
				MessagePackets.showSystem(
					`Scroll bound to #y${player.mapData.map.name}#w at #r${player.mapData.point.toGridPoint().x}, ${player.mapData.point.toGridPoint().y}#w`,
				),
			);
		} else {
			Logger.warn(`Unhandled item properties for item ${item.id} in AddItemPropsExecutable.`);
		}
	}
}
