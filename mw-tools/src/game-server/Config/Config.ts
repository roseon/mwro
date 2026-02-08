import { ResourceManager } from '../ResourceManager/ResourceManager';

type IConfig = {
	world: {
		ip: string;
		port: number;
	};
	chat: {
		ip: string;
		port: number;
	};
	databaseType: 'file' | 'couchbase' | 'mysql';
	couchbase: {
		host: string;
		username: string;
		password: string;
	};
	mysql: {
		host: string;
		port: number;
		user: string;
		password: string;
		database: string;
	};
	security: {
		globalSalt: string;
	};
	modifiers: {
		gold: number;
		exp: number;
		skill: number;
	};
};

export function getConfig(): Readonly<IConfig> {
	return ResourceManager.get('config') as Readonly<IConfig>;
}
