import bcrypt from 'bcryptjs';
import { getConfig } from '../../../Config/Config';
import { User } from '../../../GameState/User';
import { LoginFailType } from '../../../Responses/Pregame/Login';
import type { GameConnection } from '../../../Server/Game/GameConnection';
import { BaseCollection } from '../BaseCollection';
import type { UserJson } from './UserJson';

type UserDeps = { client: GameConnection };

export class UserCollection extends BaseCollection<User, UserJson, UserDeps> {
	private static instance: UserCollection | null = null;

	protected constructor() {
		super('User');
	}

	public static getInstance(): UserCollection {
		if (this.instance === null) this.instance = new UserCollection();

		return this.instance;
	}

	/**
	 * Get the database key for this object.
	 * @param obj
	 */
	public getKey(obj: User): string {
		return this.usernameToKey(obj.username);
	}

	/**
	 * Returns the user if the username and password are correct.
	 * @param username
	 * @param md5Password
	 */
	public async getUser(
		username: string,
		md5Password: string,
		deps: UserDeps,
	): Promise<[User | null, LoginFailType]> {
		let user = null;
		let col = await this.collection;

		try {
			user = await col.get(this.usernameToKey(username));
		} catch {
			user = new User(username);
			await this.saveNewUser(user, md5Password);
			return [user, LoginFailType.None];
		}

		if (!user?.password) return [null, LoginFailType.NotActivated];

		if (!(await this.compare(md5Password, user.password)))
			return [null, LoginFailType.WrongUserOrPass];

		return [this.fromJson(user, deps), LoginFailType.None];
	}

	/**
	 * Save an existing user.
	 * @param user
	 */
	public async updateUser(user: User): Promise<void> {
		let col = await this.collection;
		let key = this.getKey(user);
		let cur = await col.get(key);

		if (!cur) throw Error('User does not yet exist.');

		let json = this.toJson(user);
		json.password = cur.password;

		await col.upsert(key, json);
	}

	/**
	 * Save a new user to the database.
	 * @param user
	 * @param md5Password
	 */
	public async saveNewUser(user: User, md5Password: string): Promise<void> {
		let key = this.getKey(user);

		if (await this.exists(key)) throw Error('User with this key already exists.');

		let json = this.toJson(user);
		let hash = await this.createHash(md5Password);

		json.password = hash;
		await (await this.collection).upsert(key, json);
	}

	/**
	 * Turn object into storable json.
	 * @param obj
	 */
	protected toJson(obj: User): UserJson {
		let characterIds: number[] = [];
		for (let character of obj.characters.values()) {
			characterIds.push(character.id);
		}
		if (obj.failedCharacterIds) {
			characterIds.push(...obj.failedCharacterIds);
		}
		return {
			username: obj.username,
			password: null,
			characters: characterIds,
		};
	}

	/**
	 * Turn database json into User object.
	 * @param obj
	 * @param deps
	 */
	protected fromJson(obj: UserJson, { client }: UserDeps): User {
		let user = new User(obj.username, obj.characters);
		return user;
	}

	/**
	 * Turn the username into the database key.
	 * @param username
	 */
	private usernameToKey(username: string): string {
		return username.toLowerCase();
	}

	/**
	 * Check if the password matches the hash.
	 * @param md5Password
	 * @param hash
	 */
	private async compare(md5Password: string, hash: string): Promise<boolean> {
		return bcrypt.compare(this.processPassword(md5Password), hash);
	}

	/**
	 * Create a hash for this password.
	 * @param md5Password
	 */
	private async createHash(md5Password: string): Promise<string> {
		return bcrypt.hash(this.processPassword(md5Password), 10);
	}

	/**
	 * Adds the global salt to the password
	 * @param md5Password
	 */
	private processPassword(md5Password: string): string {
		return md5Password.toLowerCase() + getConfig().security.globalSalt;
	}
}
