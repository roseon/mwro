/**
 * Used in combination with item index in ItemInfo (packet 0x7000D).
 */
export const enum ItemListType {
	Inventory = 0,
	TradeItems = 1,
	TradePets = 2,
	PlayerShop = 3,
	NpcShop = 4,
	Equipment = 5,
	Pets = 6,
	Skills = 7,
}
