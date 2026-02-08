import { PlayerPackets } from '../../Responses/PlayerPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionMonsterRepel } from '../GameActionTypes';

/**
 * Executes actions by id.
 */
export class MonsterRepelExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionMonsterRepel) {
		super(action);
	}

	public static parse(action: GameActionMonsterRepel): MonsterRepelExecutable {
		return new this(action);
	}

	protected run(context: ClientActionContext): void {
		context.player.memory.monsterRepel = true;
		context.player.memory.monsterRepelExpiry = Date.now() + this.action.duration;
		if (this.action.applyEffect) {
			context.client.write(PlayerPackets.devilTears(context.player));
		}
	}
}
