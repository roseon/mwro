import type { Player } from '../../GameState/Player/Player';
import { BasePositionPlayerData } from '../BasePositionPlayerData';

export class ServerPositionPlayerData extends BasePositionPlayerData {
	/**
	 * Maps players from their id to the index (not offset) in the buffer.
	 */
	private readonly idMap: Map<number, number> = new Map();

	/**
	 * Add a player to the position buffer.
	 * @param player
	 */
	public addPlayer(player: Player): void {
		if (this.idMap.has(player.id)) throw Error('Player already in the list.');

		let index = this.getFreeIndex();
		this.idMap.set(player.id, index);
		this.setId(index, player.id);
		this.setMap(index, player.mapData.map.file);
		this.setGridPoint(index, player.mapData.point.toGridPoint());
		this.setDestGridPoint(index, player.mapData.dest.toGridPoint());
	}

	/**
	 * Remove a player from the position buffer.
	 * @param playerId
	 */
	public removePlayer(playerId: number): void {
		let index = this.idMap.get(playerId) ?? null;

		if (index === null) throw Error('Attempt to remove unknown player.');

		this.setId(index, 0);
		this.idMap.delete(playerId);
	}

	/**
	 * Update the buffer when the player has entered a map.
	 * @param player
	 */
	public updatePlayerMap(player: Player): void {
		let index = this.idMap.get(player.id) ?? null;

		if (index === null) return;

		this.setMap(index, player.mapData.map.file);
		let point = player.mapData.point.toGridPoint();
		this.setGridPoint(index, point);
		this.setDestGridPoint(index, point);
	}

	/**
	 * Set the destination from the player to the buffer.
	 * @param player
	 */
	public writeDestToBuffer(player: Player): void {
		let index = this.idMap.get(player.id);

		if (index === undefined) return;

		this.setDestGridPoint(index, player.mapData.dest.toGridPoint());
	}

	/**
	 * Set the coordinates from the buffer to the player.
	 * @param player
	 */
	public writeCoordinatesToPlayer(player: Player): void {
		let index = this.idMap.get(player.id);

		if (index === undefined) return;

		player.mapData.point = this.getGridPoint(index).toMapPoint();
	}

	/**
	 * Returns the first empty idMap index, throws if the list is full.
	 */
	private getFreeIndex(): number {
		for (let i = 0; i < ServerPositionPlayerData.maxPlayers; ++i) {
			if (this.getId(i) === 0) return i;
		}

		throw Error('Player limit reached.');
	}
}
