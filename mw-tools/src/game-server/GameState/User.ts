import type { GameConnection } from '../Server/Game/GameConnection';
import type { Player } from './Player/Player';
import { PlayerCollection } from '../Database/Collections/Player/PlayerCollection';

export class User {
	public characters: Player[] = [];
	public characterIds: number[] = [];
	public failedCharacterIds: number[] = [];

	public constructor(public username: string, characterIds?: number[]) {
		if (characterIds) this.characterIds = characterIds;
	}

	public async init(username: string, client: GameConnection): Promise<void> {
		let player = PlayerCollection.getInstance();
		if (this.characterIds.length > 0) {
			for (let userId of this.characterIds) {
				try {
					let tempCharacter = await player.getPlayer(userId, client);
					this.characters.push(tempCharacter);
				} catch (e) {
					console.error(`Failed to load character ${userId} for user ${username}: ${(e as Error).message}`);
					this.failedCharacterIds.push(userId);
				}
			}
		}
	}
}
