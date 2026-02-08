import type { AbstractPacketHandler } from '../../PacketHandlers/AbstractPacketHandler';
import { CharacterScreenPacketHandler } from '../../PacketHandlers/CharacterScreenPacketHandler';
import { ChatPacketHandler } from '../../PacketHandlers/ChatPacketHandler';
import { FightPacketHandler } from '../../PacketHandlers/FightPacketHandler';
import { FriendDataPacketHandler } from '../../PacketHandlers/FriendDataPacketHandler';
import { InventoryPacketHandler } from '../../PacketHandlers/InventoryPacketHandler';
import { LoginPacketHandler } from '../../PacketHandlers/LoginPacketHandler';
import { MovingPacketHandler } from '../../PacketHandlers/MovingPacketHandler';
import { NpcPacketHandler } from '../../PacketHandlers/NpcPacketHandler';
import { PartyPacketHandler } from '../../PacketHandlers/PartyPacketHandler';
import { PetPacketHandler } from '../../PacketHandlers/PetPacketHandler';
import { PlayerDataPacketHandler } from '../../PacketHandlers/PlayerDataPacketHandler';
import { PreGamePacketHandler } from '../../PacketHandlers/PreGamePacketHandler';
import { QuestPacketHandler } from '../../PacketHandlers/QuestPacketHandler';
import { SettingsPacketHandler } from '../../PacketHandlers/SettingsPacketHandler';
import { StorePacketHandler } from '../../PacketHandlers/StorePacketHandler';
import { TradePacketHandler } from '../../PacketHandlers/TradePacketHandler';
import { VendorPacketHandler } from '../../PacketHandlers/VendorPacketHandler';
import type { PacketType } from '../../PacketType';

/**
 * Stores all packet handlers.
 */
export class PacketHandlerCollection {
	private constructor(private handlers: AbstractPacketHandler[]) {}

	/**
	 * Creates the packet collection needed for the game server.
	 */
	public static createForGameServer(): PacketHandlerCollection {
		return new PacketHandlerCollection([
			new MovingPacketHandler(),
			new PreGamePacketHandler(),
			new PlayerDataPacketHandler(),
			new QuestPacketHandler(),
			new NpcPacketHandler(),
			new FightPacketHandler(),
			new FriendDataPacketHandler(),
			new PartyPacketHandler(),
			new PetPacketHandler(),
			new InventoryPacketHandler(),
			new StorePacketHandler(),
			new SettingsPacketHandler(),
			new LoginPacketHandler(),
			new CharacterScreenPacketHandler(),
			new VendorPacketHandler(),
			new TradePacketHandler(),
		]);
	}

	/**
	 * Creates the packet collection needed for the chat server.
	 */
	public static createForChatServer(): PacketHandlerCollection {
		return new PacketHandlerCollection([
			new PreGamePacketHandler(),
			new ChatPacketHandler(),
			new SettingsPacketHandler(),
		]);
	}

	/**
	 * Find the packet handler for the given type.
	 * @param type
	 */
	public getPacketHandler(type: PacketType): AbstractPacketHandler | null {
		for (let handler of this.handlers) {
			if (handler.handlesType(type)) return handler;
		}

		return null;
	}
}
