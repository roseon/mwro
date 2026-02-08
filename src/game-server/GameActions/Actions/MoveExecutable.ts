import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionMove } from '../GameActionTypes';
import { Point } from '../../Utils/Point';
import { MapPackets } from '../../Responses/MapPackets';
import { setTimeout } from 'timers';
import { Game } from '../../GameState/Game';
import { Npc } from '../../GameState/Npc/Npc';

/**
 * Executes an NPC movement or removal.
 */
export class MoveExecutable extends GameActionExecutable<ClientActionContext> {
	private despawnTimer?: NodeJS.Timeout;

	protected constructor(protected override readonly action: GameActionMove) {
		super(action);
	}

	public static parse(action: GameActionMove): MoveExecutable {
		return new this(action);
	}

	private isWithinActiveHours(activeHours?: { start: string; end: string }): boolean {
		if (!activeHours) return true;

		const now = new Date();
		const currentTime = now.getHours() * 60 + now.getMinutes();

		const [startHours, startMinutes] = activeHours.start.split(':').map(Number);
		const [endHours, endMinutes] = activeHours.end.split(':').map(Number);

		const startTime = startHours * 60 + startMinutes;
		const endTime = endHours * 60 + endMinutes;

		return currentTime >= startTime && currentTime < endTime;
	}

	private calculateTime(timing: {
		type: string;
		value: number | string | string[];
	}): number | null {
		if (timing.type === 'interval') {
			return timing.value as number;
		} else if (timing.type === 'time') {
			const now = new Date();
			const currentTime = now.getHours() * 60 + now.getMinutes();

			let targetTime: number;
			if (Array.isArray(timing.value)) {
				// Handle array of times
				const timeInMinutes = timing.value.map(time => {
					const [hours, minutes] = time.split(':').map(Number);
					return hours * 60 + minutes;
				});
				const nextTime = timeInMinutes.find(time => time > currentTime);
				if (!nextTime) return null;
				targetTime = nextTime;
			} else {
				// Handle single time
				const [hours, minutes] = (timing.value as string).split(':').map(Number);
				targetTime = hours * 60 + minutes;
				if (targetTime < currentTime) return null;
			}

			const minutesUntilTarget = targetTime - currentTime;
			return minutesUntilTarget * 60 * 1000;
		}
		return null;
	}

	protected run({ game, player }: ClientActionContext): void {
		const npc = player.memory.activeNpc;
		if (!npc) return;

		if (this.action.point) {
			// Move NPC to new position
			npc.mapData.point = new Point(this.action.point.x, this.action.point.y);
			npc.mapData.dest = npc.mapData.point;
			npc.mapData.map.sendPacket(MapPackets.npcRemove([npc]));
			npc.mapData.map.sendPacket(MapPackets.npcAdd([npc]));
		} else {
			// Store original spawn point
			const originalPoint = npc.mapData.point;

			// Remove the NPC
			npc.mapData.map.sendPacket(MapPackets.npcRemove([npc]));
			game.removeNpc(npc);

			// Schedule single respawn if within active hours
			if (this.action.respawn && this.isWithinActiveHours(this.action.respawn.activeHours)) {
				const respawnDelay = this.calculateTime(this.action.respawn);
				if (respawnDelay !== null) {
					setTimeout(() => {
						// Generate new random position if respawnRadius is set
						if (this.action.respawnRadius) {
							const newPoint = originalPoint.getRandomNearby(
								this.action.respawnRadius.min,
								this.action.respawnRadius.max,
							);
							// Randomly flip x and y coordinates to cover all directions
							const flipX = Math.random() < 0.5;
							const flipY = Math.random() < 0.5;
							const finalPoint = new Point(
								originalPoint.x + (flipX ? -1 : 1) * (newPoint.x - originalPoint.x),
								originalPoint.y + (flipY ? -1 : 1) * (newPoint.y - originalPoint.y),
							);
							npc.mapData.point = finalPoint;
							npc.mapData.dest = finalPoint;
						}

						game.addNpc(npc);
						npc.mapData.map.sendPacket(MapPackets.npcAdd([npc]));

						// Handle despawn if configured
						if (this.action.despawn) {
							// Clear any existing despawn timer
							if (this.despawnTimer) {
								clearTimeout(this.despawnTimer);
							}

							const despawnDelay = this.calculateTime(this.action.despawn);
							if (despawnDelay !== null) {
								this.despawnTimer = setTimeout(() => {
									npc.mapData.map.sendPacket(MapPackets.npcRemove([npc]));
									game.removeNpc(npc);
								}, despawnDelay);
							}
						}
					}, respawnDelay);
				}
			}
		}
	}
}
