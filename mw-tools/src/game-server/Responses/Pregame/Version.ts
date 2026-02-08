import { createPacket } from '../../PacketBuilder';
import { PacketType } from '../../PacketType';

let packet = createPacket(16);
packet.writeUInt32LE(PacketType.VersionResponse, 8);
packet.set([1, 0, 48, 35], 12);

export const versionPacket = packet;
