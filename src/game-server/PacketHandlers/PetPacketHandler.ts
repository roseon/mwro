import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import { PetPackets } from '../Responses/PetPackets';
import type { PlayerConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { endAtZero, isValidName } from '../Utils/StringUtils';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles pet-related packets.
 */
export class PetPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type >= 0x00060000 && type < 0x00070000;
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
			case PacketType.PetList:
				client.write(PetPackets.list(client.player.pets));

				if (client.player.activePet) {
					client.write(PetPackets.battle(client.player.activePet));
					client.write(PetPackets.skills(client.player.activePet));
				}

				break;
			case PacketType.PetRename:
				this.onRename(packet, client);
				break;
			case PacketType.PetUseStats:
				this.onUseStats(packet, client);
				break;
			case PacketType.PetFollow:
				this.onFollow(packet, client);
				break;
			case PacketType.PetUnfollow:
				this.onUnfollow(packet, client);
				break;
			case PacketType.PetBattle:
				this.onBattle(packet, client);
				break;
			case PacketType.PetUnbattle:
				this.onUnbattle(packet, client);
				break;
			case PacketType.PetRemove:
				this.onRemove(packet, client);
				break;
			case PacketType.PetResist:
				if (client.player.activePet)
					client.write(PetPackets.resist(client.player.activePet));
				break;
			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * Happens when the player renames their pet.
	 * @param packet
	 * @param client
	 */
	private onRename(packet: Buffer, client: PlayerConnection): void {
		let id = packet.readUInt32LE(12);
		let name = endAtZero(packet.toString('ascii', 16));
		let pet = client.player.pets.find(p => p.id === id);

		if (!pet) return;

		if (!isValidName(name)) {
			client.write(PetPackets.rename(pet, false));
			return;
		}

		pet.name = name;
		client.write(PetPackets.rename(pet, true));
	}

	/**
	 * Happens when the player assigns the pet's stat points.
	 * @param packet
	 * @param client
	 */
	private onUseStats(packet: Buffer, client: PlayerConnection): void {
		let id = packet.readUInt32LE(12);
		let pet = client.player.pets.find(p => p.id === id);

		if (!pet) return;

		let sta = packet.readUInt16LE(18);
		let int = packet.readUInt16LE(20);
		let str = packet.readUInt16LE(22);
		let agi = packet.readUInt16LE(24);
		let sum = sta + int + str + agi;

		let stats = pet.fightData.stats;
		if (stats.unused < sum) return;

		stats.unused -= sum;
		stats.hp.pointsBase += sta;
		stats.mp.pointsBase += int;
		stats.attack.pointsBase += str;
		stats.speed.pointsBase += agi;

		// TODO update things?

		client.write(PetPackets.useStats(pet));
	}

	/**
	 * Pet is set to follow.
	 * @param packet
	 * @param client
	 */
	private onFollow(packet: Buffer, client: PlayerConnection): void {
		let id = packet.readUInt32LE(12);
		let pet = client.player.pets.find(p => p.id === id);

		if (!pet) return;

		client.write(PetPackets.follow(pet, client.player));
	}

	/**
	 * Pet is set to not follow.
	 * @param packet
	 * @param client
	 */
	private onUnfollow(packet: Buffer, client: PlayerConnection): void {
		let id = packet.readUInt32LE(12);
		let pet = client.player.pets.find(p => p.id === id);

		if (!pet) return;

		client.write(PetPackets.unfollow(pet));
	}

	/**
	 * A pet gets set as active.
	 * @param packet
	 * @param client
	 */
	private onBattle(packet: Buffer, client: PlayerConnection): void {
		let id = packet.readUInt32LE(12);
		let pet = client.player.pets.find(p => p.id === id);

		if (!pet) return;

		client.player.activePet = pet;
		client.write(PetPackets.battle(pet));
		client.write(PetPackets.skills(pet));
	}

	/**
	 * A pet gets set as unactive.
	 * @param packet
	 * @param client
	 */
	private onUnbattle(packet: Buffer, client: PlayerConnection): void {
		let pet = client.player.activePet;
		let id = packet.readUInt32LE(12);

		if (!pet || id !== pet.id) return;

		client.player.activePet = null;
		client.write(PetPackets.unbattle(pet));
	}

	/**
	 * Pet gets removed 😿.
	 * @param packet
	 * @param client
	 */
	private onRemove(packet: Buffer, client: PlayerConnection): void {
		let id = packet.readUInt32LE(12);
		let index = client.player.pets.findIndex(p => p.id === id);

		if (index === -1) return;

		let pet = client.player.pets[index];

		if (client.player.activePet === pet) client.player.activePet = null;

		client.player.pets.splice(index, 1);
		client.write(PetPackets.remove(id));
	}
}
