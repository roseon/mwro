import type { Player } from '../GameState/Player/Player';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import { PlayerSimpleStruct } from './Structs/PlayerSimpleStruct';

const enum PartyRequestResponse {
	NotLeader = -3,
	AlreadyJoined = -2,
	Full = -1,
	Success = 0,
	Incoming = 1,
}

export abstract class PartyPackets {
	/**
	 * Shows a message to say you tried to join someone who is not a party leader.
	 */
	public static readonly addRequestErrorNotleader: Packet = new Packet(
		16,
		PacketType.PartyAddRequest,
	).int8(12, PartyRequestResponse.NotLeader);

	/**
	 * Shows a message to say you already joined the party.
	 */
	public static readonly addRequestErrorAlreadyJoined: Packet = new Packet(
		16,
		PacketType.PartyAddRequest,
	).int8(12, PartyRequestResponse.AlreadyJoined);

	/**
	 * Shows a message to say the party is already full.
	 */
	public static readonly addRequestErrorFull: Packet = new Packet(
		16,
		PacketType.PartyAddRequest,
	).int8(12, PartyRequestResponse.Full);

	/**
	 * Shows a message to say you successfully sent a request to join a party.
	 */
	public static readonly addRequestSuccess: Packet = new Packet(
		16,
		PacketType.PartyAddRequest,
	).int8(12, PartyRequestResponse.Success);

	/**
	 * Clears all join requests.
	 */
	public static readonly clearRequests: Packet = new Packet(16, PacketType.PartyClearRequests);

	/**
	 * After creating a party.
	 * @param id
	 */
	public static create(id: number): Packet {
		return new Packet(20, PacketType.PartyCreate).uint32(16, id);
	}

	/**
	 * Tell the party-leader a player wants to join.
	 * @param player
	 */
	public static addRequest(player: Player): Packet {
		return new Packet(16 + PlayerSimpleStruct.size, PacketType.PartyAddRequest)
			.int8(12, PartyRequestResponse.Incoming)
			.struct(16, PlayerSimpleStruct, player);
	}

	/**
	 * Removes the id from the list of players that want to join the party.
	 * @param id
	 */
	public static removeRequest(id: number): Packet {
		return new Packet(20, PacketType.PartyRemoveRequest).uint32(16, id);
	}

	/* Seems to be useless? Only thing it does is setting the player's status to follow.
		To add the player to the party on accepting, addPlayer needs to be sent, which
		also sets the player's status to follow.
	public static accept(id: number): Packet{
		return new Packet(20, PacketType.PartyAccept).uint32(16, id);
	}*/

	/**
	 * Removes a player from the party.
	 * @param id
	 */
	public static removePlayer(id: number): Packet {
		return new Packet(16, PacketType.PartyRemovePlayer).uint32(12, id);
	}

	/**
	 * Add a player to the party.
	 * @param player
	 */
	public static addPlayer(player: Player): Packet {
		return new Packet(16 + PlayerSimpleStruct.size, PacketType.PartyAddPlayer)
			.int32(12, player.id)
			.struct(16, PlayerSimpleStruct, player);
	}

	/**
	 * Update the list of join-requests.
	 * @param players
	 */
	public static requestList(players: Player[]): Packet {
		let packet = new Packet(
			16 + PlayerSimpleStruct.size * players.length,
			PacketType.PartyRequestList,
		)
			.uint16(6, PlayerSimpleStruct.size * players.length)
			.uint8(12, players.length);

		for (let i = 0; i < players.length; ++i)
			packet.struct(16 + i * PlayerSimpleStruct.size, PlayerSimpleStruct, players[i]);

		return packet;
	}

	/**
	 * Update the list of members in the party.
	 * @param players
	 */
	public static memberList(players: Player[]): Packet {
		let packet = new Packet(
			16 + PlayerSimpleStruct.size * players.length,
			PacketType.PartyMemberList,
		)
			.uint16(6, PlayerSimpleStruct.size * players.length)
			.uint8(12, players.length);

		for (let i = 0; i < players.length; ++i)
			packet.struct(16 + i * PlayerSimpleStruct.size, PlayerSimpleStruct, players[i]);

		return packet;
	}
}
