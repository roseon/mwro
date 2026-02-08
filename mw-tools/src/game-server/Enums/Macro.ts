/**
 * Macros are sent along with packet 0x40004. They open various UI windows.
 * Macro number 36 exists in the client but doesn't do anything.
 */
export const enum Macro {
	NpcMessageClosable = 32,
	NpcMessageOptions = 33,
	ViewShop = 34,
	SellItems = 35,
	Deposit = 37,
	Withdraw = 38,
	NpclessMessageClosable = 39,
	NpclessMessageOptions = 40,
	DepositGold = 48,
	WithdrawGold = 49,
	LocalMessage = 64,
	SystemMessage = 65,
	Prompt = 80,
	GuildList = 81,
	PromptPassword = 82,
	GuildManagement = 83,
	QuestList = 84,
	Inventory = 85,
	Pets = 86,
	Stats = 87,
	Minimap = 88,
}
