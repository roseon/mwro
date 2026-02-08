import { FightActionCommand } from '../Enums/FightActionCommand';
import { Logger } from '../Logger/Logger';
import { PacketType } from '../PacketType';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles auto fight toggle packets.
 */
export class AutoFightPacketHandler extends AbstractPacketHandler {
	public handlesType(type: PacketType): boolean {
		return type === PacketType.Unk130010;
	}

	public handlePacket(packet: Buffer, client: PacketConnection): void {
		if (!this.hasPlayer(client)) return;

		const player = client.player;
		player.fightData.autoEnabled = !player.fightData.autoEnabled;
		Logger.info(
			`Auto fight toggled ${player.fightData.autoEnabled ? 'on' : 'off'} for ${player.id}`,
		);

		if (player.fightData.autoEnabled && !player.fightData.lastAction) {
			player.fightData.lastAction = { type: FightActionCommand.Melee, detail: 0 };
		}

		const fight = player.fightData.currentFight;
		const member = fight?.members?.get(player.id) ?? null;
		if (!member) return;

		if (player.fightData.autoEnabled) {
			const lastAction = player.fightData.lastAction ?? {
				type: FightActionCommand.Melee,
				detail: 0,
			};
			member.action.type = lastAction.type;
			member.action.detail = lastAction.detail;
			member.action.autoTarget = true;
		} else {
			member.action.autoTarget = false;
		}
	}
}
