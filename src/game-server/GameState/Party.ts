import { PlayerEffect } from '../Enums/PlayerEffect';
import type { Packet } from '../PacketBuilder';
import { PartyPackets } from '../Responses/PartyPackets';
import type { Player } from './Player/Player';

export class Party {
	public readonly members: Player[];
	public readonly requests: Player[] = [];

	public constructor(public readonly leader: Player) {
		this.members = [leader];
	}

	/**
	 * Removes a join-request and sends an update to the leader.
	 * @param id
	 */
	public removeRequestAndSend(id: number): void {
		let index = this.requests.findIndex(player => player.id === id);

		if (index !== -1) this.requests.splice(index, 1);

		this.leader.client?.write(PartyPackets.removeRequest(id));
	}

	/**
	 * Accepts a request and sends updates.
	 * May remove request in some circustances.
	 * @param id
	 */
	public acceptRequestAndSend(id: number): void {
		// Party is full, ignore
		if (this.members.length >= 5) return;

		let index = this.requests.findIndex(player => player.id === id);

		// Request not found, delete from client
		if (index === -1) {
			this.leader.client?.write(PartyPackets.removeRequest(id));
			return;
		}

		let player = this.requests[index];

		// Player is disconnected or already in a party, remove request.
		if (player.client === null || player.party !== null) {
			this.requests.splice(index, 1);
			this.leader.client?.write(PartyPackets.removeRequest(id));
			return;
		}

		// Player is in a fight, can't accept yet, but don't remove.
		if (player.fightData.currentFight !== null) return;

		this.requests.splice(index, 1);
		this.members.push(player);
		player.party = this;
		player.effect.add(PlayerEffect.Follow);
		this.sendPacket(PartyPackets.addPlayer(player));
		this.sendPacket(PartyPackets.memberList(this.members));
	}

	/**
	 * Removes the player from the party.
	 * Dismantles the party if the player is the leader.
	 * @param player
	 */
	public removeMember(id: number): void {
		if (id === this.leader.id) {
			this.destroyParty();
			return;
		}

		let index = this.members.findIndex(player => player.id === id);

		if (index === -1) return;

		let player = this.members[index];
		this.sendPacket(PartyPackets.removePlayer(player.id));
		this.members.splice(index, 1);
		player.party = null;
		player.effect.remove(PlayerEffect.Follow);
	}

	/**
	 * Dismantles the party.
	 */
	private destroyParty(): void {
		this.leader.effect.remove(PlayerEffect.Leader);

		for (let member of this.members) {
			member.effect.remove(PlayerEffect.Follow);
			member.party = null;

			if (member !== this.leader) member.client?.write(PartyPackets.removePlayer(member.id));
		}

		this.leader.mapData.map.sendPacket(PartyPackets.removePlayer(this.leader.id));
		this.members.length = 0;
		this.requests.length = 0;
	}

	/**
	 * Send packet to all players in this party.
	 * @param packet
	 */
	public sendPacket(...packets: (Buffer | Packet)[]): void {
		for (let player of this.members) {
			player.client?.write(...packets);
		}
	}
}
