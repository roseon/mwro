export type ServerInfo = {
	name: string;
	id: number;
	ip: [number, number, number, number];
	port: number;
	population: number;
};

/**
 * Creates the Door.DAT contents.
 *
 * File structure:
 * All integers are stored in little endian.
 * Offset	Size				Description
 * 0		256					0
 * 256		4					Server data start (256 + 16 = 272)
 * 260		4					Size of file (256 + 16 + serverCount * 84)
 * 264		4					Size used per server (84)
 * 268		4					0
 * 272		84 * serverCount	Server data
 *
 * Server data structure:
 * Offset	Size	Descripton
 * 0		64		Name
 * 64		4		Id
 * 68		4		Ip (e.g. 7F 00 00 01 for 127.0.0.1)
 * 72		4		Port
 * 76		4		Population (changes the servers color in the game's server list)
 * 80		4		1 (Unknown)
 * @param servers
 */
export function createDoorDat(servers: ServerInfo[]): Buffer {
	let sCount = servers.length;
	let offset = 256;
	let srvStart = offset + 16;
	let srvSize = 84;
	let totSize = srvStart + srvSize * sCount;

	let buffer = Buffer.alloc(totSize, 0, 'binary');

	buffer.writeUInt32LE(srvStart, offset);
	buffer.writeUInt32LE(totSize, offset + 4);
	buffer.writeUInt32LE(srvSize, offset + 8);

	for (let i = 0; i < sCount; ++i) {
		let srv = servers[i];
		let start = srvStart + srvSize * i;
		buffer.write(srv.name, start);
		buffer.writeUInt32LE(srv.id, start + 64);
		buffer.set(srv.ip, start + 68);
		buffer.writeUInt32LE(srv.port, start + 72);
		buffer.writeUInt32LE(srv.population, start + 76);
		buffer[start + 80] = 1;
	}

	return buffer;
}
