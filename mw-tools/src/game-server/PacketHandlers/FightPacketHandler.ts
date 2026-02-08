import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles packets used during a fight.
 */
export class FightPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type >= 0xc0000 && type < 0xd0000;
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
			case PacketType.FightReady:
				this.onFightReady(packet, client);
				break;
			case PacketType.FightAction:
				this.onFightAction(packet, client);
				break;
			case PacketType.FightTurnDone:
				this.onFightTurnDone(packet, client);
				break;
			case PacketType.FightPetAction:
				this.onFightPetAction(packet, client);
				break;
			case PacketType.FightClosed:
				this.onFightClosed(packet, client);
				break;
			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * Client is ready to start the fight.
	 * @param packet
	 * @param client
	 */
	private onFightReady(packet: Buffer, client: PlayerConnection): void {
		let fight = client.player.fightData.currentFight ?? null;
		fight?.readyWaiter?.check(client.player);
	}

	/**
	 * Client specifies what action to take.
	 * @param packet
	 * @param client
	 */
	private onFightAction(packet: Buffer, client: PlayerConnection): void {
		let fight = client.player.fightData.currentFight ?? null;
		let member = fight?.members?.get(client.player.id) ?? null;

		if (fight === null || member === null) return;

		let source = packet.readUInt32LE(20);
		if (source !== client.player.id) throw Error('Unexpected source: ' + source.toString(16));

		member.action.type = packet.readUInt32LE(16);
		member.action.setTarget(packet.readUInt32LE(24));
		member.action.detail = packet.readUInt32LE(28);
	}

	/**
	 * Client has processed the action result.
	 * @param packet
	 * @param client
	 */
	private onFightTurnDone(packet: Buffer, client: PlayerConnection): void {
		let fight = client.player.fightData.currentFight ?? null;
		fight?.turnReadyWaiter?.check(client.player);
	}

	/**
	 * Pet specifies what action to take.
	 * @param packet
	 * @param client
	 */
	private onFightPetAction(packet: Buffer, client: PlayerConnection): void {
		let pet = client.player.activePet;

		if (pet === null) return;

		let fight = client.player.fightData.currentFight ?? null;
		let member = fight?.members?.get(pet.id) ?? null;

		if (fight === null || member === null) return;

		let source = packet.readUInt32LE(20);
		if (source !== pet.id) throw Error('Unexpected source: ' + source.toString(16));

		member.action.type = packet.readUInt32LE(16);
		member.action.setTarget(packet.readUInt32LE(24));
		member.action.detail = packet.readUInt32LE(28);
	}

	/**
	 * Client has exited the fight.
	 * @param packet
	 * @param client
	 */
	private onFightClosed(packet: Buffer, client: PlayerConnection): void {
		let fight = client.player.fightData.currentFight ?? null;
		fight?.endWaiter?.check(client.player);

		client.player?.playerCollection?.updatePlayer(client.player);
	}
}
