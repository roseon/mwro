import type { Socket } from 'net';
import type { Player } from '../../GameState/Player/Player';
import { PacketConnection } from '../Packet/PacketConnection';
import type { PacketHandlerCollection } from '../Packet/PacketHandlerCollection';
import type { ChatServer } from './ChatServer';
import type { ChatServerChannelWriter } from './ChatServerChannelWriter';

/**
 * A client connection on the chat server.
 * Connection happens after the user picks a character.
 */
export class ChatConnection extends PacketConnection {
	public constructor(
		socket: Socket,
		server: ChatServer,
		packetHandlers: PacketHandlerCollection,
		public readonly channelWriter: ChatServerChannelWriter,
		public readonly player: Player,
	) {
		super(socket, server, packetHandlers);
	}

	protected override onClose(hadError: boolean): void {
		// Clean up channel writer connections when the socket closes
		this.channelWriter.removePlayerConnections(this.player.id);
		super.onClose(hadError);
	}
}
