/**
 * Manages cooldowns for chat messages to prevent spam.
 */
export class ChatCooldownManager {
	private static instance: ChatCooldownManager | null = null;
	private cooldowns: Map<number, number> = new Map(); // playerId -> lastMessageTime

	// Cooldown times in milliseconds
	private static readonly COOLDOWNS = {
		local: 1000, // 1 second
		party: 1000, // 1 seconds
		market: 1000, // 1 seconds
		world: 5000, // 5 seconds
		private: 1000, // 2 seconds
	};

	private constructor() {}

	public static getInstance(): ChatCooldownManager {
		if (this.instance === null) {
			this.instance = new ChatCooldownManager();
		}
		return this.instance;
	}

	/**
	 * Check if a player can send a message of the given type.
	 * @param playerId The player's ID
	 * @param type The type of chat message
	 * @returns true if the player can send a message, false if they're on cooldown
	 */
	public canSendMessage(
		playerId: number,
		type: 'local' | 'world' | 'private' | 'party' | 'market',
	): boolean {
		const now = Date.now();
		const lastMessageTime = this.cooldowns.get(playerId) || 0;
		const cooldownTime = ChatCooldownManager.COOLDOWNS[type];

		if (now - lastMessageTime < cooldownTime) {
			return false;
		}

		this.cooldowns.set(playerId, now);
		return true;
	}

	/**
	 * Get the remaining cooldown time in milliseconds.
	 * @param playerId The player's ID
	 * @param type The type of chat message
	 */
	public getRemainingCooldown(
		playerId: number,
		type: 'local' | 'world' | 'private' | 'party' | 'market',
	): number {
		const now = Date.now();
		const lastMessageTime = this.cooldowns.get(playerId) || 0;
		const cooldownTime = ChatCooldownManager.COOLDOWNS[type];
		const remaining = cooldownTime - (now - lastMessageTime);
		return Math.max(0, remaining);
	}
}
