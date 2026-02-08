import { PlayerCollection } from '../Database/Collections/Player/PlayerCollection';
import type { CharacterGender, CharacterRace } from '../Enums/CharacterClass';
import { Player } from '../GameState/Player/Player';
import { PlayerCreator } from '../GameState/Player/PlayerCreator';
import { getPacketType } from '../PacketReader';
import { PacketType } from '../PacketType';
import { CharacterScreenPackets } from '../Responses/CharacterScreenPackets';
import { ChatPackets } from '../Responses/ChatPackets';
import { LoginPackets } from '../Responses/LoginPackets';
import { MessagePackets } from '../Responses/MessagePackets';
import type { PlayerConnection, UserConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { endAtZero, isValidName } from '../Utils/StringUtils';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles packets for viewing, choosing and creating characters.
 */
export class CharacterScreenPacketHandler extends AbstractPacketHandler {
	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return (
			type === PacketType.CharacterList ||
			type === PacketType.CharacterChoice ||
			type === PacketType.CharacterCreate
		);
	}

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public handlePacket(packet: Buffer, client: PacketConnection): void {
		if (!this.hasUser(client)) return;

		let type = getPacketType(packet);

		switch (type) {
			// Retrieve a character list
			case PacketType.CharacterList:
				client.write(CharacterScreenPackets.characterList(client.user.characters));
				break;

			// The client picked a character
			case PacketType.CharacterChoice:
				this.onCharacterChoice(packet, client);
				break;

			// The client creates a character
			case PacketType.CharacterCreate:
				this.onCharacterCreate(packet, client);
				break;

			default:
				this.notImplemented(packet);
		}
	}

	/**
	 * Respond to the player's character choice.
	 * @param packet
	 * @param client
	 */
	private onCharacterChoice(packet: Buffer, client: UserConnection): void {
		let id = packet.readUInt32LE(12);
		let player = client.user.characters.find(c => c.id === id);

		if (!player) {
			client.write(CharacterScreenPackets.characterChoiceError);
			return;
		}

		if (client.hasLoggedInPlayer(player.id)) {
			client.write(LoginPackets.characterAlreadyLoggedIn());
			return;
		}

		client.write(CharacterScreenPackets.characterChoiceConfirm);
		this.loginAsCharacter(client, player);
	}

	/**
	 * Handle character creation request.
	 * @param packet
	 * @param client
	 */
	private async onCharacterCreate(packet: Buffer, client: UserConnection): Promise<void> {
		if (client.user.characters.length >= 5) {
			client.write(
				MessagePackets.showMessage('Too many characters please delete one and try again'),
			);
			return;
		}

		let race: CharacterRace = packet.readUInt8(35);
		let gender: CharacterGender = packet.readUInt8(36);

		if (race > 3 || gender > 1) return;

		let name = packet.toString('ascii', 20, 34);
		name = endAtZero(name);

		if (!isValidName(name)) {
			client.write(CharacterScreenPackets.characterCreateNameError);
			return;
		}

		let characterCollection = PlayerCollection.getInstance();

		// Check to make sure name is unique
		let allCharacters = await characterCollection.getAllPlayers();
		if (allCharacters.length > 0) {
			let names: string[] = [];
			for (let character of allCharacters) {
				names.push(character.name.toLowerCase());
			}
			if (names.includes(name.toLowerCase())) {
				client.write(CharacterScreenPackets.characterCreateNameExists);
				return;
			}
		}

		let props = await PlayerCreator.create(race, gender, name);
		let player = new Player(props, client.game);

		player.fightData.stats.healHp();
		player.fightData.stats.healMp();

		client.user.characters.push(player);
		client.write(CharacterScreenPackets.characterCreateConfirm);

		player.playerCollection = characterCollection;

		// Update the player fight stats
		player.fightStats.update(player);

		if (player.playerCollection) {
			await player.playerCollection.saveNewPlayer(player);
		}
		if (client.userCollection) {
			await client.userCollection.updateUser(client.user);
		}

		this.loginAsCharacter(client, player);
	}

	/**
	 * Logs the user in as the given character.
	 * @param client
	 * @param player
	 */
	private loginAsCharacter(client: UserConnection, player: Player): void {
		if (client.player) throw new Error('Client is already assigned to a player.');

		if (player.client) throw new Error('Player is already assigned to a client.');

		client.player = player;

		let playerCollection = PlayerCollection.getInstance();

		client.player.playerCollection = playerCollection;

		player.client = client as PlayerConnection;

		client.prepareForChatConnection();
		client.write(ChatPackets.serverInfo);

		client.game.onPlayerEnter(player);
	}
}
