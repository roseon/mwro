import { Macro } from '../../Enums/Macro';
import { Packet } from '../../PacketBuilder';
import { PacketType } from '../../PacketType';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionBank } from '../GameActionTypes';
import { ItemPackets } from '../../Responses/ItemPackets';

/**
 * Handles all bank operations including:
 * - Withdrawing items
 * - Depositing items
 * - Withdrawing gold
 * - Depositing gold
 */
export class BankExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionBank) {
		super(action);
	}

	public static parse(action: GameActionBank): BankExecutable {
		return new this(action);
	}

	protected run({ player }: ClientActionContext): void {
		const packet = new Packet(16, PacketType.SendMacro);

		switch (this.action.operation) {
			case 'withdraw':
				packet.uint8(12, Macro.Withdraw);
				player.client?.write(packet);
				player.client?.write(ItemPackets.bankItemList(player.items.bank));
				break;
			case 'deposit':
				packet.uint8(12, Macro.Deposit);
				player.client?.write(packet);
				break;
			case 'withdrawGold':
				packet.uint8(12, Macro.WithdrawGold);
				player.client?.write(packet);
				break;
			case 'depositGold':
				packet.uint8(12, Macro.DepositGold);
				player.client?.write(packet);
				break;
			default:
				throw new Error(`Unknown bank operation: ${this.action.operation}`);
		}
	}
}
