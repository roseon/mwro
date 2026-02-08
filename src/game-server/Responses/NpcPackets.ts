import { Macro } from '../Enums/Macro';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';

export abstract class NpcPackets {
	/**
	 * An NPC dialog without options, closed by clicking anywhere in it.
	 * @param message
	 */
	public static dialogClosable(message: string): Packet {
		let packet = new Packet(16 + message.length + 1, PacketType.SendMacro);
		packet.buffer.writeUInt16BE(6, message.length); // TODO BE or offset 7?

		return packet.uint8(12, Macro.NpcMessageClosable).string(16, message);
	}

	/**
	 * An NPC dialog where the player is required to pick one of the options.
	 * @param message A message, followed by byte 0, followed by options seperated with &-characters.
	 */
	public static dialogWithOptions(message: string): Packet {
		let packet = new Packet(16 + message.length + 1, PacketType.SendMacro);
		packet.buffer.writeUInt16BE(6, message.length); // TODO BE or offset 7?

		return packet.uint8(12, Macro.NpcMessageOptions).string(16, message);
	}
}
