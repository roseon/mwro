import { createPacket } from '../../PacketBuilder';
import { PacketType } from '../../PacketType';

// Every now and then the client pings the server, so we ping back.
// It may not be required for the server to always respond to pings.
let packet = createPacket(12);
packet.writeUInt32LE(PacketType.KeepAlive, 8);

export const keepAlivePacket = packet;
