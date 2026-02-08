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
	{
		id: 10,
		name: 'Recruit My Power',
		description: 'Skill Rank 20+',
		category: 'SkillRank',
	},
	{
		id: 11,
		name: 'Corporal Is Taking Me',
		description: 'Skill Rank 40+',
		category: 'SkillRank',
	},
	{
		id: 12,
		name: 'Sergeant Power House',
		description: 'Skill Rank 60+',
		category: 'SkillRank',
	},
	{
		id: 13,
		name: 'General Time',
		description: 'Skill Rank 80+',
		category: 'SkillRank',
	},
];

// Get a title by it's ID
export function getTitleById(id: number): Title | undefined {
	return titles.find(title => title.id === id);
}
