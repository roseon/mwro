import { createPacket } from '../PacketBuilder';
import { PacketType } from '../PacketType';

export abstract class LoginPackets {
	/**
	 * Account is already logged in
	 * @param message
	 */
	public static accountAlreadyLoggedIn(): Buffer {
		let packet = createPacket(20);
		packet.writeUInt32LE(PacketType.AccountAlreadyIn, 8);

		return packet;
	}

	/**
	 * Character is already logged in
	 * @param message
	 */
	public static characterAlreadyLoggedIn(): Buffer {
		let packet = createPacket(20);
		packet.writeUInt32LE(PacketType.CharacterAlreadyIn, 8);

		return packet;
	}
}
