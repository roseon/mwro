/**
 * Various player stats. Separated from the player class for cleanliness.
 */
export class PlayerMisc {
	/**
	 * Players should receive 1 reputation point per hour. Used for reborn.
	 */
	public reputation: number = 0;

	/**
	 * How many times the player has died.
	 */
	public deaths: number = 0;

	/**
	 * PK Points change the players title.
	 * TODO how are these calculated?
	 */
	public pkPoints: number = 0;

	/**
	 * Number of times the player has won a PK fight (?).
	 */
	public pkKills: number = 0;

	/**
	 * Guild war related.
	 */
	public warExp: number = 0;
}
