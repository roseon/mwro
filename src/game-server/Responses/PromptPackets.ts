import { Macro } from '../Enums/Macro';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';

export abstract class PromptPackets {
	/**
	 * Shows a prompt dialog to the player.
	 * @param message The message to show in the prompt
	 */
	public static show(message: string): Packet {
		let packet = new Packet(16 + message.length + 1, PacketType.SendMacro);
		packet.buffer.writeUInt16BE(6, message.length);
		return packet.uint8(12, Macro.Prompt).string(16, message);
	}
}
