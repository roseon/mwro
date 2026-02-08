import { Random } from '../../Utils/Random';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionShapeShift } from '../GameActionTypes';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import { FightStats } from '../../GameState/Fight/FightStats';
import { Resist } from '../../GameState/Resist';
/**
 * Apply temporary stat bonuses and visual changes to the player
 */
export class ShapeShiftExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionShapeShift) {
		super(action);
	}

	public static parse(action: GameActionShapeShift): ShapeShiftExecutable {
		return new this(action);
	}

	protected run({ game, player }: ClientActionContext): void {
		let file = player.file;
		// Apply new shapeshift
		if (this.action.file === 0) {
			// Reversion case
			// Remove stats
			player.memory.shapeshiftState.stats = {};
		} else if (this.action.file) {
			// Normal shapeshift case
			file = this.action.file;
			player.memory.shapeshiftState.stats = this.action.stats;
		}

		// Update player and all players on map
		player.client?.write(PlayerPackets.sspUse(player, file));
		player.mapData.map?.sendPacket(PlayerPackets.sspUse(player, file), player);

		// Update fight stats and send to client
		player.fightStats.update(player);
		player.client?.write(PlayerPackets.information(player));
		player.client?.write(PlayerPackets.resist(player));
	}
}
