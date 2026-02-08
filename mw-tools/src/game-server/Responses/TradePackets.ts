import type { Npc } from '../GameState/Npc/Npc';
import type { Pet } from '../GameState/Pet/Pet';
import type { Player } from '../GameState/Player/Player';
import { Logger } from '../Logger/Logger';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import { MapCharacterStruct } from './Structs/MapCharacterStruct';
import { MapMoveStruct } from './Structs/MapMoveStruct';

export abstract class TradePackets {
	public static tradeRequestSend(targetId: number): Packet {
		let packet = new Packet(16, PacketType.TradeRequestSend);
		Logger.info('Trade request send');
		Logger.info(packet.buffer.toString('hex'));
		return packet;
	}

	public static tradeRequestRcv(targetId: number): Packet {
		let packet = new Packet(16, PacketType.TradeRequestRcv);
		packet.uint32(12, targetId);
		Logger.info('Trade request rcv', { targetId });
		Logger.info(packet.buffer.toString('hex'));
		return packet;
	}

	public static tradeRequestClose(): Packet {
		let packet = new Packet(16, PacketType.TradeRequestClose);
		Logger.info('Trade request close');
		return packet;
	}

	public static tradeReset(targetId: number): Packet {
		let packet = new Packet(16, PacketType.TradeReset);
		packet.uint32(12, targetId);
		Logger.info('Trade reset');
		return packet;
	}

	public static tradeItemList(): Packet {
		let packet = new Packet(16, PacketType.TradeItemList);
		Logger.info('Trade item listpacket');
		Logger.info(packet.buffer.toString('hex'));
		return packet;
	}

	public static tradeShowItem(
		items: { index: number; count: number }[],
		goldOffered?: number,
	): Packet {
		const packet = new Packet(44, PacketType.TradeShowItem);
		packet.uint8(4, 128);
		packet.uint8(5, 150);
		packet.uint8(6, 28);
		packet.uint8(7, 0);
		// First item
		if (items.length > 0) {
			packet
				.uint32(16, items[0].index) //is actually the file id
				.uint32(28, items[0].count)
				.uint32(20, 4294967295)
				.uint32(32, 0)
				.uint32(24, 4294967295)
				.uint32(36, 0);
		}

		// Second item
		if (items.length > 1) {
			packet
				.uint32(20, items[1].index)
				.uint32(32, items[1].count)
				.uint32(24, 4294967295)
				.uint32(36, 0);
		}

		// Third item
		if (items.length > 2) {
			packet.uint32(24, items[2].index).uint32(36, items[2].count);
		}

		if (goldOffered) {
			packet.uint32(40, goldOffered);
		}

		Logger.info('Trade show item sent to target', { packet });
		return packet;
	}

	public static tradeRequestFail(): Packet {
		let packet = new Packet(16, PacketType.TradeRequestSend).uint32(12, 4294967295);
		return packet;
	}
}
