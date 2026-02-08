import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import { QuestPackets } from '../Responses/QuestPackets';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles packets regarding the player quests.
 */
export class QuestPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type === PacketType.QuestAdd;
	}

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public handlePacket(packet: Buffer, client: PacketConnection): void {
		if (!this.hasPlayer(client)) return;

		let type = getPacketType(packet);

		switch (type) {
			// Retrieve quest list
			case PacketType.QuestAdd:
				this.onQuestAdd(packet, client);
				break;
			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * The client wants the questlist.
	 * @param packet
	 * @param client
	 */
	private onQuestAdd(packet: Buffer, client: PlayerConnection): void {
		let quests = client.player.quests.getAll();

		// There's no packet for a list of quests, instead add each one individually.
		for (let quest of quests) client.write(QuestPackets.add(quest));
	}
}
