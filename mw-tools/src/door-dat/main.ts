import { writeFileSync } from 'fs';
import type { ServerInfo } from './door';
import { createDoorDat } from './door';

let servers: ServerInfo[] = [
	{
		name: 'Local Server',
		id: 1001,
		ip: [127, 0, 0, 1],
		port: 9008,
		population: 1,
	},
];

let buffer = createDoorDat(servers);
writeFileSync('client/Door.DAT', buffer);
