import type { GameConnection } from '../Server/Game/GameConnection';
import type { Player } from './Player/Player';
import { PlayerCollection } from '../Database/Collections/Player/PlayerCollection';

export class User {
	public characters: Player[] = [];
	public characterIds: number[] = [];

	public constructor(public username: string, characterIds?: number[]) {
		if (characterIds) this.characterIds = characterIds;
	}

	public async init(username: string, client: GameConnection): Promise<void> {
		let player = PlayerCollection.getInstance();
		if (this.characterIds.length > 0) {
			for (let userId of this.characterIds) {
				let tempCharacter = await player.getPlayer(userId, client);

				this.characters.push(tempCharacter);
			}
		} else {
			this.characters.push(await player.testPlayer(client));
		}
	}
}
