interface Title {
	id: number; // Unique identifier for the title
	name: string; // Display name of the title
	description: string; // Description or requirements for the title
	category?: string; // Optional, maybe use for assigning bonuses in future
}

export const titles: Title[] = [
	{
		id: 1,
		name: 'Novice',
		description: 'Starting title for new players',
		category: 'Progression',
	},
	{
		id: 2,
		name: 'Adventurer',
		description: 'Awarded for completing the tutorial',
		category: 'Achievement',
	},
	{
		id: 3,
		name: 'Master',
		description: 'Awarded for gaining all skills',
		category: 'Achievement',
	},
];

// Get a title by it's ID
export function getTitleById(id: number): Title | undefined {
	return titles.find(title => title.id === id);
}
