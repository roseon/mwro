export const enum EquipmentSlot {
	Head = 0,
	Armour = 1,
	Weapon = 2,
	Shoes = 3,
	Necklace = 4,
	Bracelet = 5,
	Ring = 6,
}

export const EquipmentSlotNames: Record<EquipmentSlot, string> = {
	[EquipmentSlot.Head]: 'Head',
	[EquipmentSlot.Armour]: 'Armour',
	[EquipmentSlot.Weapon]: 'Weapon',
	[EquipmentSlot.Shoes]: 'Shoes',
	[EquipmentSlot.Necklace]: 'Necklace',
	[EquipmentSlot.Bracelet]: 'Bracelet',
	[EquipmentSlot.Ring]: 'Ring',
};
