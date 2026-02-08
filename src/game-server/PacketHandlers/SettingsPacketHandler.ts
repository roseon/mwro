import type { IPlayerSettings } from '../GameState/Player/IPlayerSettings';
import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import { ChatConnection } from '../Server/Chat/ChatConnection';
import { GameConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles settings packets.
 */
export class SettingsPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type === PacketType.SettingsUpdate;
	}

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public handlePacket(packet: Buffer, client: PacketConnection): void {
		let type = getPacketType(packet);

		switch (type) {
			case PacketType.SettingsUpdate:
				this.onSettingsUpdate(packet, client);
				break;
			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * The client sends this when changing the settings, enabling / disabling
	 * chat channels, and right after connecting to the chat server.
	 * @param packet
	 * @param client
	 */
	private onSettingsUpdate(packet: Buffer, client: PacketConnection): void {
		let settings: IPlayerSettings = {
			pkEnabled: packet.readUInt8(16) === 1,
			mailEnabled: packet.readUInt8(17) === 1,
			tradeEnabled: packet.readUInt8(18) === 1,
			addFriendEnabled: packet.readUInt8(19) === 1,
			partyEnabled: packet.readUInt8(20) === 1,
			refuseOtherMessagesEnabled: packet.readUInt8(21) === 1,
			localChatEnabled: packet.readUInt8(22) === 1,
			partyChatEnabled: packet.readUInt8(23) === 1,
			pmChatEnabled: packet.readUInt8(24) === 1,
			guildChatEnabled: packet.readUInt8(25) === 1,
			marketChatEnabled: packet.readUInt8(26) === 1,
			worldChatEnabled: packet.readUInt8(27) === 1,
		};

		if (client instanceof ChatConnection) {
			client.channelWriter.updateSettings(client, settings);
		} else if (client instanceof GameConnection && client.hasPlayer()) {
			// TODO
		}
	}
}
