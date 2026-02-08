import { PlayerCollection } from '../../../Database/Collections/Player/PlayerCollection';
import type { GameConnection } from '../../../Server/Game/GameConnection';
import type { ActionTemplateCallback } from '../ActionTemplateExecutable';

export const deleteCharacter: ActionTemplateCallback = ({ client, player }) => {
	const user = client.user;
	if (!user) return;

	const removeCharacter = async (): Promise<void> => {
		try {
			await PlayerCollection.getInstance().remove(player.id.toString());
		} catch {
			// Ignore removal errors
		}

		user.characters = user.characters.filter(c => c.id !== player.id);
		user.characterIds = user.characterIds.filter(id => id !== player.id);

		try {
			await client.userCollection?.updateUser(user);
		} catch {
			// Ignore update errors
		}

		if (client.player?.id === player.id) {
			client.game.onPlayerLeave(player);
			player.client = null;
			(client as GameConnection).player = null;
		}

		client.closeConnection();
	};

	void removeCharacter();
};
