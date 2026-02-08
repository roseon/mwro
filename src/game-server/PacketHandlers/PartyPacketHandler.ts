import { PlayerEffect } from '../Enums/PlayerEffect';
import { Party } from '../GameState/Party';
import { Logger } from '../Logger/Logger';
import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import { PartyPackets } from '../Responses/PartyPackets';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles party-related packets.
 */
export class PartyPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type >= 0x00030030 && type <= 0x00030039;
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
			case PacketType.PartyCreate:
				this.onCreate(packet, client);
				break;
			case PacketType.PartyAddRequest:
				this.onAddRequest(packet, client);
				break;
			case PacketType.PartyRemoveRequest:
				this.onRemoveRequest(packet, client);
				break;
			case PacketType.PartyAccept:
				this.onAccept(packet, client);
				break;
			case PacketType.PartyRemovePlayer:
				this.onRemovePlayer(packet, client);
				break;
			case PacketType.PartyMemberList:
				this.onMemberList(client);
				break;
			case PacketType.PartyClearRequests:
				this.onClearRequests(client);
				break;
			default:
				Logger.info(packet);
				this.notImplemented(packet);
		}
	}

	/**
	 * Happens when the player clicks themself with the flag.
	 * @param packet
	 * @param client
	 */
	private onCreate(packet: Buffer, client: PlayerConnection): void {
		if (client.player.party !== null) return;

		let id = packet.readUInt32LE(12);

		if (id !== client.player.id) return;

		client.player.party = new Party(client.player);
		client.player.effect.add(PlayerEffect.Leader);
		client.player.mapData.map.sendPacket(PartyPackets.create(id));
		client.write(PartyPackets.memberList(client.player.party.members));
	}

	/**
	 * Happens when the player clicks someone else with the flag.
	 * @param packet
	 * @param client
	 */
	private onAddRequest(packet: Buffer, client: PlayerConnection): void {
		if (client.player.party !== null) return;

		let id = packet.readUInt32LE(12);

		if (id === client.player.id) return;

		let target = client.game.players.get(id);

		if (!target?.client) return;

		if (target.party === null) {
			client.write(PartyPackets.addRequestErrorNotleader);
			return;
		}

		if (target.party.members.length >= 5) {
			client.write(PartyPackets.addRequestErrorFull);
			return;
		}

		if (target.party.requests.includes(client.player)) {
			client.write(PartyPackets.addRequestErrorAlreadyJoined);
			return;
		}

		target.party.requests.push(client.player);
		client.write(PartyPackets.addRequestSuccess);
		target.client.write(PartyPackets.addRequest(client.player));
	}

	/**
	 * Happens when the party-leader rejects a join-request.
	 * @param packet
	 * @param client
	 */
	private onRemoveRequest(packet: Buffer, client: PlayerConnection): void {
		let party = client.player.party;

		if (party === null || party.leader !== client.player) return;

		let id = packet.readUInt32LE(12);
		party.removeRequestAndSend(id);
	}

	/**
	 * Happens when the party-leader accepts a join-request.
	 * @param packet
	 * @param client
	 */
	private onAccept(packet: Buffer, client: PlayerConnection): void {
		let party = client.player.party;

		if (party === null || party.leader !== client.player) return;

		let id = packet.readUInt32LE(12);
		party.acceptRequestAndSend(id);
	}

	/**
	 * Happens when a player leaves or gets kicked.
	 * @param packet
	 * @param client
	 */
	private onRemovePlayer(packet: Buffer, client: PlayerConnection): void {
		let party = client.player.party;

		if (party === null) return;

		let id = packet.readUInt32LE(12);

		if (id !== client.player.id && client.player !== party.leader) return;

		party.removeMember(id);
	}

	/**
	 * TODO Refresh the member list?
	 * @param client
	 */
	private onMemberList(client: PlayerConnection): void {
		let party = client.player.party;

		if (party === null) return;

		client.write(PartyPackets.memberList(party.requests));
	}

	/**
	 * Happens when the player clicks the clear button in the request list.
	 * @param packet
	 * @param client
	 */
	private onClearRequests(client: PlayerConnection): void {
		let party = client.player.party;

		if (party === null || party.leader !== client.player) return;

		party.requests.length = 0;
		client.write(PartyPackets.clearRequests);
	}
}
