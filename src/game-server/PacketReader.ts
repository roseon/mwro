import { PacketType } from './PacketType';

/**
 * Reads multiple packets out of the buffer.
 * @param data
 */
export function readPackets(data: Buffer): Buffer[] {
	let packets: Buffer[] = [];

	while (data.length > 4) {
		// Bytes 0 and 1 have to be 0x5547
		if (data[0] !== 0x55 || data[1] !== 0x47) throw Error('Invalid packet header.');

		// Bytes 2 and 3 have to be the packet length - 4
		let length = data.readUInt16LE(2) + 4;
		if (length > data.length) throw Error('Invalid packet length.');

		if (length === data.length) {
			packets.push(data);
			break;
		}

		packets.push(data.subarray(0, length));
		data = data.subarray(length);
	}

	return packets;
}

/**
 * Return the type of this package.
 * @param packet
 */
export function getPacketType(packet: Buffer): PacketType {
	let type = packet.readUInt32LE(8);

	if (!(type in PacketType)) throw Error('Unknown packet type: ' + type);

	return type;
}
