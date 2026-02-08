export type PlayerTitlesJson = {
	title: number | null;
	titles: number[];
};

/**
 * Manages the player's titles.
 */
export class PlayerTitles {
	/**
	 * Currently selected title.
	 */
	public title: number | null = null;

	/**
	 * Titles the player can use.
	 */
	public titles: number[] = [];

	/**
	 * Creates a new PlayerTitles instance.
	 * @param titles Initial titles to set, if any
	 */
	public constructor(json: PlayerTitlesJson) {
		this.title = json.title ?? null;
		this.titles = json.titles ?? [];
	}

	/**
	 * Adds a title ID to the player's available titles if not already owned.
	 * @param titleId The ID of the title to add
	 * @returns True if the title was added, false if already owned
	 */
	public addTitle(titleId: number): boolean {
		if (!this.titles.includes(titleId)) {
			this.titles.push(titleId);
			return true;
		}
		return false;
	}

	/**
	 * Sets the current active title by ID.
	 * @param titleId The ID of the title to set as active, or null to clear
	 * @returns True if the title was set successfully, false if the title is not owned
	 */
	public setCurrentTitle(titleId: number | null): boolean {
		if (titleId === null) {
			this.title = null;
			return true;
		}

		if (!this.titles.includes(titleId)) {
			return false;
		}

		this.title = titleId;
		return true;
	}

	/**
	 * Turn titles into storable object.
	 * @returns
	 */
	public toJson(): PlayerTitlesJson {
		let json: PlayerTitlesJson = {
			title: this.title,
			titles: this.titles,
		};

		return json;
	}

	/**
	 * Recreate titles from stored information
	 * @param titles
	 * @returns
	 */
	public static fromJson(titles: PlayerTitlesJson): PlayerTitles {
		let playerTitles = new PlayerTitles(titles);

		return playerTitles;
	}
}
