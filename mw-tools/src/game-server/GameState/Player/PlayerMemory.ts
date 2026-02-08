import type { ClientActionContext } from '../../GameActions/GameActionContext';
import type { GameActionExecutable } from '../../GameActions/GameActionExecutable';
import type { Item } from '../Item/Item';
import type { Npc } from '../Npc/Npc';
import type { Player } from '../Player/Player';
import type { PlayerVendor } from '../Player/PlayerVendor';
import type { ChatConnection } from '../../Server/Chat/ChatConnection';
import type { Pet } from '../Pet/Pet';
import { FightStatJson } from '../Fight/FightStats';

export type ShapeshiftState = {
	file?: number;
	stats?: FightStatJson;
};

/**
 * Various caches used while the player is online.
 */
export class PlayerMemory {
	/**
	 * The npc the player is currently interacting with.
	 */
	public activeNpc: Npc | null = null;

	/**
	 * The options the activeNpc offered the player.
	 */
	public npcOptions: GameActionExecutable<ClientActionContext>[] | null = null;

	/**
	 * The items the activeNpc offered to sell to the player.
	 */
	public npcItems: Item[] | null = null;

	/**
	 * Used for starting random monster fights.
	 */
	public stepCount: number = 0;

	/**
	 * The number of mails the player has.
	 */
	public mailCount: number = 0;

	/**
	 * The last player who received a PM from this player
	 */
	public lastPmRecipient: Player | null = null;

	/**
	 * The chat connection of the last PM recipient
	 */
	public lastPmConnection: ChatConnection | null = null;

	public promptResponse: GameActionExecutable<ClientActionContext> | null = null;

	/**
	 * The text response from the last prompt
	 */
	public promptText: string | null = null;

	/**
	 * The items the vendor offered to sell to the player.
	 */
	public vendorItems: PlayerVendor[] | null = null;

	/**
	 * Used for starting random monster fights.
	 * The name of the player's shop
	 */
	public vendorName: string | null = null;

	/**
	 * The id of the player the player is trading with.
	 */
	public tradeTargetId: number | null = null;

	/**
	 * Whether the player has confirmed the trade.
	 */
	public tradeConfirm: boolean = false;

	/**
	 * The items the player is trading.
	 */
	public itemsOffered: (Item | Pet)[] = [];

	/**
	 * The items the player is receiving.
	 */
	public itemsOffering: (Item | Pet)[] = [];

	public goldOffered: number = 0;

	public goldOffering: number = 0;

	/**
	 * Unique id of the last used item.
	 */
	public lastItemUsedIndex: number | null = null;

	/**
	 * Tracks the shapeshift state
	 */
	public shapeshiftState: ShapeshiftState = { file: undefined, stats: {} };

	/**
	 * Whether the player is repelling monsters (for Devil's Tears)
	 */
	public monsterRepel: boolean = false;

	/**
	 * The expiry time of the monster repel effect.
	 */
	public monsterRepelExpiry: number = 0;

	/**
	 * The name of the currently open shop (store).
	 * Used to determine currency or special logic during purchase.
	 */
	public shopName: string | null = null;
}
