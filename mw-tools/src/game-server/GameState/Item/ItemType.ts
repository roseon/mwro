export enum ItemType {
	// Nothing happens when using.
	None = 0,
	// Item gets moved to equipment when using.
	Equipment = 1,
	// Item action gets called and item gets removed
	Consumable = 2,
	// Item action gets called, item stays
	Usable = 3,
	// Item cannot be used, but is needed for quests
	Quest = 4,
}
