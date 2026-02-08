/**
 * Damage is increased or decreased when monsters/pets of certain species attack each other.
 *
 * X does 18% more damage to Y:
 * - Demon to Flying
 * - Flying to Special
 * - Special to Undead
 * - Undead to Human
 * - Human to Dragon
 * - Dragon to Demon
 *
 * X does 9% more damage to Y:
 * - Demon to Human
 * - Human to Special
 * - Special to Demon
 * - Flying to Undead
 * - Undead to Dragon
 * - Dragon to Flying
 */
export const enum Species {
	Empty = 0,
	Demon = 1,
	Flying = 2,
	Special = 3,
	Undead = 4,
	Human = 5,
	Dragon = 6,
}
