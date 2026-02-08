import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles packets regarding npcs.
 */
export class NpcPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type === PacketType.TalkToNpc || type === PacketType.NpcDialogClose;
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
			// Player talks to npc
			case PacketType.TalkToNpc:
				this.onTalkToNpc(packet, client);
				break;
			// Player closes npc dialog (with and without option)
			case PacketType.NpcDialogClose:
				this.onNpcDialogClose(packet, client);
				break;
			// Player gives item to npc
			case PacketType.ItemGive:
				this.onGiveToNpc(packet, client);
				break;
			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * The player has given something to an NPC.
	 * @param packet
	 * @param client
	 */
	private onGiveToNpc(packet: Buffer, client: PlayerConnection): void {
		let npcId = packet.readUInt32LE(12);
		let npc = client.game.npcs.get(npcId);

		if (!npc) return;

		npc.onGive(client);
	}


	/**
	 * The player has clicked on an NPC.
	 * @param packet
	 * @param client
	 */
	private onTalkToNpc(packet: Buffer, client: PlayerConnection): void {
		let npcId = packet.readUInt32LE(12);
		let npc = client.game.npcs.get(npcId);

		if (!npc) return;

		npc.onTalk(client);
	}

	/**
	 * The player has closed a dialog.
	 * @param packet
	 * @param client
	 */
	private onNpcDialogClose(packet: Buffer, client: PlayerConnection): void {
		let npc = client.player?.memory?.activeNpc;

		if (!npc) return;

		let option = packet.readUInt8(12);

		// Value 255 means the player closed a dialog without options.
		// We store the callback for that in slot 0 so change it to that.
		if (option === 255) option = 0;

		npc.onCloseDialog(client, option);
	}
}
