import type { Player } from '../GameState/Player/Player';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import { PlayerSimpleStruct } from './Structs/PlayerSimpleStruct';

export abstract class CharacterScreenPackets {
	/**
	 * Confirm the player's character choice.
	 */
	public static readonly characterChoiceConfirm: Packet = new Packet(
		16,
		PacketType.CharacterChoice,
	);

	/**
	 * Show an error after the player picked a character.
	 */
	public static readonly characterChoiceError: Packet = new Packet(
		16,
		PacketType.CharacterChoice,
	).int32(12, -1);

	/**
	 * Confirm the creation of the character.
	 */
	public static readonly characterCreateConfirm: Packet = new Packet(
		16,
		PacketType.CharacterCreate,
	).uint32(4, 0);

	/**
	 * Could not create the character because the name is in use.
	 */
	public static readonly characterCreateNameExists: Packet = new Packet(
		16,
		PacketType.CharacterCreate,
	).int32(12, -2);

	/**
	 * Could not create the character because the name is invalid.
	 */
	public static readonly characterCreateNameError: Packet = new Packet(
		16,
		PacketType.CharacterCreate,
	).int32(12, -1);

	/**
	 * Show a list of characters.
	 */
	public static characterList(characters: Player[]): Packet {
		let packet = new Packet(
			16 + characters.length * PlayerSimpleStruct.size,
			PacketType.CharacterList,
		)
			.uint16(4, 0)
			.uint16(6, characters.length * PlayerSimpleStruct.size)
			.uint16(12, characters.length);

		for (let i = 0; i < characters.length; ++i)
			packet.struct(16 + i * PlayerSimpleStruct.size, PlayerSimpleStruct, characters[i]);

		return packet;
	}
}
