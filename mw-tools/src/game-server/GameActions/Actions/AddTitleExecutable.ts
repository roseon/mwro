import { MessagePackets } from '../../Responses/MessagePackets';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionAddTitle } from '../GameActionTypes';

/**
 * Add a title to the player.
 */
export class AddTitleExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionAddTitle) {
		super(action);
	}

	public static parse(action: GameActionAddTitle): AddTitleExecutable {
		return new this(action);
	}

	protected run({ client, player }: ClientActionContext): void {
		const titleAdded = player.titles.addTitle(this.action.titleId);

		if (titleAdded) {
			// Send the specific title addition packet first
			client.write(PlayerPackets.titleAdd(this.action.titleId));

			// Then send the system message
			client.write(MessagePackets.showSystem(`You received a new title!`));
		}
	}
}
