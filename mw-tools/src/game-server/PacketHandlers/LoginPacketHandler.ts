import { getConfig } from '../Config/Config';
import { UserCollection } from '../Database/Collections/User/UserCollection';
import { PacketType } from '../PacketType';
import { LoginType, loginPacket } from '../Responses/Pregame/Login';
import { LoginPackets } from '../Responses/LoginPackets';
import { GameConnection } from '../Server/Game/GameConnection';
import type { PacketConnection } from '../Server/Packet/PacketConnection';
import { endAtZero } from '../Utils/StringUtils';
import { AbstractPacketHandler } from './AbstractPacketHandler';

/**
 * Handles the login packet.
 */
export class LoginPacketHandler extends AbstractPacketHandler {
	private readonly rounds: number = 32;
	private readonly delta: number = 0x9e3779b9;
	private readonly key1: Readonly<Uint32Array>;
	private readonly key2: Readonly<Uint32Array>;

	public constructor() {
		super();

		let { ip, port } = getConfig().world;
		let ipParts = ip.split('.').map(s => Number.parseInt(s));

		this.key1 = new Uint32Array([
			(ipParts[3] << 24) | (ipParts[2] << 16) | (ipParts[1] << 8) | ipParts[0],
			port,
			(port << 16) | 1, // TODO not sure where the 1 comes from, might be ipParts[3]
			port,
		]);

		this.key2 = new Uint32Array([this.key1[2], this.key1[3], this.key1[1], this.key1[0]]);
	}

	/**
	 * Checks if this packet handler is used to handle a packet type.
	 * @param type
	 */
	public handlesType(type: PacketType): boolean {
		return type === PacketType.Login;
	}

	/**
	 * Handles the given packet.
	 * @param packet
	 * @param client
	 */
	public handlePacket(packet: Buffer, client: PacketConnection): void {
		if (!(client instanceof GameConnection)) return;

		this.onLogin(packet, client);
	}

	/**
	 * The client tries to login.
	 * @param packet
	 * @param client
	 */
	private async onLogin(packet: Buffer, client: GameConnection): Promise<void> {
		if (this.hasUser(client)) return;

		let buffer = packet.subarray(16);
		let passMD5 = '';
		let userDec = Buffer.alloc(16);

		this.decrypt(buffer.subarray(0, 8), this.key2);

		for (let i = 0; i < 32; ++i) passMD5 += String.fromCharCode(buffer[1 + i * 2]);

		for (let i = 0; i < 16; ++i) userDec[15 - i] = buffer[60 - 4 * i];

		this.decrypt(userDec.subarray(0, 8), this.key1);

		let username = endAtZero(userDec.toString('ascii'));

		if (client.hasLoggedInUser(username)) {
			client.write(LoginPackets.accountAlreadyLoggedIn());
			return;
		}

		let user = UserCollection.getInstance();
		let [login, reason] = await user.getUser(username, passMD5, { client });

		if (login) {
			client.write(loginPacket(LoginType.Success));
			client.user = login;
			client.userCollection = user;
			login.init(username, client);
		} else {
			client.write(loginPacket(LoginType.Fail, reason));
		}
	}

	/**
	 * Decrypts the first 8 bytes of the value using a modified xtea algorithm.
	 * @param value
	 * @param key
	 */
	private decrypt(value: Buffer, key: Readonly<Uint32Array>): void {
		let y = value.readUInt32LE(0);
		let z = value.readUInt32LE(4);
		let sum = this.delta * this.rounds;

		while (sum) {
			z -= ((y << 4) ^ (y >>> 5)) + (y ^ sum) + key[(sum >>> 11) & 3];
			sum -= this.delta;
			y -= ((z << 4) ^ (z >>> 5)) + (z ^ sum) + key[sum & 3];
		}

		value.writeUInt32LE(y >>> 0, 0);
		value.writeUInt32LE(z >>> 0, 4);
	}
}
