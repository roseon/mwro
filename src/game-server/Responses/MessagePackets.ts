import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';

const enum MessageType {
	Error = 0,
	Message = 1,
	System = 2,
}

export abstract class MessagePackets {
	/**
	 * Shows a blue message in the middle of the screen.
	 * @param message
	 */
	public static showMessage(message: string): Packet {
		return this.message(message, MessageType.Message);
	}

	/**
	 * Shows a red message in the middle of the screen.
	 * Player has to click or press a key to continue.
	 * @param message
	 */
	public static showError(message: string): Packet {
		return this.message(message, MessageType.Error);
	}

	/**
	 * Shows a message in chat on the system channel.
	 * @param message
	 */
	public static showSystem(message: string): Packet {
		return this.message(message, MessageType.System);
	}

	private static message(message: string, mode: MessageType): Packet {
		return new Packet(16 + message.length + 1, PacketType.ShowMessage)
			.uint8(12, mode)
			.string(16, message);
	}
}
