import type { IPlayerSettings } from '../../GameState/Player/IPlayerSettings';
import { Logger } from '../../Logger/Logger';
import type { Packet } from '../../PacketBuilder';
import { ToggleSet } from '../../Utils/ToggleSet';
import type { ChatConnection } from './ChatConnection';

/**
 * Keeps track of who has what chat channel enabled,
 * and offers a way to send packets to those players.
 * TODO lots
 */
export class ChatServerChannelWriter {
	private allConnections: Set<ChatConnection> = new Set();
	private localChatConnections: ToggleSet<ChatConnection> = new ToggleSet();
	private partyChatConnections: ToggleSet<ChatConnection> = new ToggleSet();
	private marketChatConnections: ToggleSet<ChatConnection> = new ToggleSet();
	private worldChatConnections: ToggleSet<ChatConnection> = new ToggleSet();
	private pmChatConnections: ToggleSet<ChatConnection> = new ToggleSet();

	/**
	 * Update the user settings for a connection.
	 * @param client
	 * @param settings
	 */
	public updateSettings(client: ChatConnection, settings: IPlayerSettings): void {
		// Remove any existing connections for this player
		this.removePlayerConnections(client.player.id);

		this.allConnections.add(client);
		this.localChatConnections.set(client, settings.localChatEnabled);
		this.partyChatConnections.set(client, settings.partyChatEnabled);
		this.marketChatConnections.set(client, settings.marketChatEnabled);
		this.worldChatConnections.set(client, settings.worldChatEnabled);
		this.pmChatConnections.set(client, settings.pmChatEnabled);
	}

	/**
	 * Remove all connections for a specific player ID
	 * @param playerId The ID of the player whose connections should be removed
	 */
	public removePlayerConnections(playerId: number): void {
		for (const connection of this.allConnections) {
			if (connection.player.id === playerId) {
				this.allConnections.delete(connection);
				this.localChatConnections.delete(connection);
				this.partyChatConnections.delete(connection);
				this.marketChatConnections.delete(connection);
				this.worldChatConnections.delete(connection);
				this.pmChatConnections.delete(connection);
			}
		}
	}

	/**
	 * Send a packet to EVERYONE who has local chat enbled.
	 * TODO signifcantly improve efficiency
	 * @param packet
	 * @param sender The connection of the player who sent the message
	 */
	public local(packet: Packet, sender: ChatConnection): void {
		const senderPlayer = sender.player;
		if (!senderPlayer) return;

		const senderMap = senderPlayer.mapData.map;

		// Only send to players on the same map who have local chat enabled
		for (let con of this.localChatConnections) {
			const receiverPlayer = con.player;
			if (!receiverPlayer) continue;

			// Check if receiver is on the same map as sender
			if (receiverPlayer.mapData.map === senderMap) {
				// Always send to the sender
				if (receiverPlayer.id === senderPlayer.id) {
					con.write(packet);
					continue;
				}

				const CHAT_RADIUS = 40;

				// Convert both positions to grid points for distance calculation
				const senderGridPoint = senderPlayer.mapData.point.toGridPoint();
				const receiverGridPoint = receiverPlayer.mapData.point.toGridPoint();

				// Calculate distance using grid coordinates
				const dx = Math.abs(senderGridPoint.x - receiverGridPoint.x);
				if (dx > CHAT_RADIUS) continue;

				const dy = Math.abs(senderGridPoint.y - receiverGridPoint.y);
				if (dy > CHAT_RADIUS) continue;

				const squaredDistance = dx * dx + dy * dy;
				const CHAT_RADIUS_SQUARED = CHAT_RADIUS * CHAT_RADIUS;

				if (squaredDistance <= CHAT_RADIUS_SQUARED) {
					con.write(packet);
				}
			}
		}
	}

	/**
	 * Send a packet to everyone in the same party as the sender.
	 * @param packet
	 * @param sender The connection of the player who sent the message
	 */
	public party(packet: Packet, sender: ChatConnection): void {
		for (let con of this.partyChatConnections) {
			if (con.player.party === sender.player?.party && sender.player?.party) {
				con.write(packet);
			}
		}
	}

	/**
	 * Send a packet to everyone who has market chat enabled.
	 * @param packet
	 */
	public market(packet: Packet): void {
		for (let con of this.marketChatConnections) con.write(packet);
	}

	/**
	 * Send a packet to everyone who has world chat enabled.
	 * @param packet
	 */
	public world(packet: Packet): void {
		for (let con of this.worldChatConnections) con.write(packet);
	}

	/**
	 * Send a packet to a specific player by ID.
	 * @param targetId The ID of the player to send the packet to
	 * @param packet The packet to send
	 */
	public sendToPlayer(targetId: number, packet: Packet): void {
		let sent = false;

		for (let connection of this.allConnections) {
			if (connection.player.id === targetId) {
				try {
					connection.write(packet);
					sent = true;
					break;
				} catch (error) {
					Logger.error(`Failed to send packet to player ${targetId}: ${error}`);
					// Remove failed connection
					this.removePlayerConnections(targetId);
				}
			}
		}

		if (!sent) {
			Logger.debug(`Could not find active connection for player ${targetId}`);
		}
	}

	/**
	 * Send a packet to the specific recipient of a private message.
	 * @param packet The packet containing the private message
	 * @param recipientId The ID of the player who should receive the message
	 */
	public private(packet: Packet, recipientId: number): void {
		let found = false;

		// Check if we have a cached connection for this recipient
		const sender = this.pmChatConnections.values().next().value?.player;
		if (sender?.memory.lastPmRecipient?.id === recipientId) {
			const cachedConnection = sender.memory.lastPmConnection;
			if (cachedConnection && cachedConnection.player.id === recipientId) {
				cachedConnection.write(packet);
				return;
			}
		}

		// If no cache hit, search through connections
		for (let con of this.pmChatConnections) {
			if (con.player.id === recipientId) {
				con.write(packet);

				// Cache the connection for future use
				if (sender) {
					sender.memory.lastPmRecipient = con.player;
					sender.memory.lastPmConnection = con;
				}

				found = true;
				break;
			}
		}

		if (!found) {
			return;
		}
	}
}
