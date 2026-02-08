import { FightActionCommand } from '../../Enums/FightActionCommand';
import { FightEffect } from '../../Enums/FightEffect';
import { FightType } from '../../Enums/FightType';
import type { ClientActionContext } from '../../GameActions/GameActionContext';
import { createClientContext } from '../../GameActions/GameActionContext';
import type { GameActionExecutable } from '../../GameActions/GameActionExecutable';
import { Logger } from '../../Logger/Logger';
import type { Packet } from '../../PacketBuilder';
import { FightPackets } from '../../Responses/FightPackets';
import { MapPackets } from '../../Responses/MapPackets';
import { MessagePackets } from '../../Responses/MessagePackets';
import { PetPackets } from '../../Responses/PetPackets';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import { Point } from '../../Utils/Point';
import { TimedWaiter } from '../../Utils/TimedWaiter';
import type { Game } from '../Game';
import { Monster } from '../Monster/Monster';
import { Player } from '../Player/Player';
import { SkillsGroup } from '../Skills/SkillsGroup';
import { Skills, eligibleSkills } from '../Skills/Skills'; // Added import
import type { FightMemberBase } from './FightMember';
import { FightMember } from './FightMember';

export class Fight {
	/**
	 * Participants in the fight, mapped by ID.
	 */
	public readonly members: Map<number, FightMember> = new Map();

	/**
	 * All players in this fight.
	 */
	public readonly players: Set<Player> = new Set();

	/**
	 * FightMembers on sideA (location index < 10) sorted by highest speed first.
	 */
	public readonly sideA: FightMember[] = [];

	/**
	 * FightMembers on sideB (location index >= 10) sorted by highest speed first.
	 */
	public readonly sideB: FightMember[] = [];

	/**
	 * Waits for players to send FightReady.
	 */
	public readyWaiter: TimedWaiter<Player> | null = null;

	/**
	 * Waits for players to send FightTurnDone;
	 */
	public turnReadyWaiter: TimedWaiter<Player> | null = null;

	/**
	 * Waits for players to send FightEnd.
	 */
	public endWaiter: TimedWaiter<Player> | null = null;

	/**
	 * Action that gets called on every player that wins the fight.
	 */
	public onMapPlayerFightWin: GameActionExecutable<ClientActionContext> | null = null;

	/**
	 * Action that gets called on every player that closes the fight.
	 */
	public onFightClose: GameActionExecutable<ClientActionContext> | null = null;

	/**
	 * Type of fight so it will only provide rewards on a monster fight
	 */
	private fightType: FightType;

	/**
	 * Winning side
	 */
	public winningSide: number | null = null;

	public constructor(
		private game: Game,
		sideA: FightMemberBase[],
		sideB: FightMemberBase[],
		fightType: FightType,
		onFightClose?: GameActionExecutable<ClientActionContext>,
	) {
		this.fightType = fightType;
		this.onFightClose = onFightClose ?? null;

		this.setLocations(sideA, sideB);

		for (let member of this.members.values()) {
			if (member.base instanceof Player) this.players.add(member.base);
		}
	}

	/**
	 * Set the locations for the side
	 * @param members
	 * @param side
	 * @returns
	 */
	private setLocations(sideA: FightMemberBase[], sideB: FightMemberBase[]): void {
		let location = 0;
		for (let member of sideA) {
			location = this.setLocationsFightMember(member, location, 'a');
		}

		location = 10;
		for (let member of sideB) {
			location = this.setLocationsFightMember(member, location, 'b');
		}
	}

	/**
	 * Create FightMember for locations
	 * @param member
	 * @param location
	 * @param side
	 * @returns
	 */
	private setLocationsFightMember(
		member: FightMemberBase,
		location: number,
		side: 'a' | 'b',
	): number {
		let fightMember = new FightMember(this, member);
		if (member instanceof Player) {
			// Players should always been in the even locations
			if (location % 2 !== 0) location += 1;
		}
		fightMember.location = location;
		location += 1;

		if (side == 'a') this.sideA.push(fightMember);
		else this.sideB.push(fightMember);

		this.members.set(member.id, fightMember);

		return location;
	}

	/**
	 * Start the fight.
	 */
	public start(): void {
		this.game.fights.add(this);

		for (let member of this.members.values()) {
			if (member.base instanceof Player) {
				member.base.fightData.currentFight = this;
			}
			member.base.fightStats.update(member.base);
		}

		this.sortBySpeed();
		this.readyWaiter = new TimedWaiter(() => this.onFightReady(), this.players, 20_000);
		this.sendPacket(FightPackets.start(this));
	}

	/**
	 * Get the members of one side of the fight.
	 * @param member
	 * @param opposite
	 */
	public getSide(member: FightMember, opposite: boolean): Readonly<FightMember[]> {
		let sideA = member.location < 10;

		if (opposite) sideA = !sideA;

		return sideA ? this.sideA : this.sideB;
	}

	/**
	 * Check if player won the fight
	 * @param Player
	 */
	public checkWinner(player: Player): boolean {
		if (this.winningSide) {
			for (let member of this.members.values()) {
				if (player === member.base) {
					if (
						member.location < this.winningSide &&
						member.location >= this.winningSide - 10
					)
						return true;
				}
			}
		}
		return false;
	}

	/**
	 * Sorts the players on each side.
	 */
	private sortBySpeed(): void {
		// Reset all members' action flags for the new round
		for (const member of [...this.sideA, ...this.sideB]) {
			member.hasActed = false;
		}

		// Combine both sides into one array and sort by speed
		const allMembers = [...this.sideA, ...this.sideB];
		allMembers.sort(FightMember.compareSpeed);

		// Clear existing sides
		this.sideA.length = 0;
		this.sideB.length = 0;

		// Redistribute members back to their original sides while maintaining new speed order
		for (const member of allMembers) {
			if (member.location < 10) {
				this.sideA.push(member);
			} else {
				this.sideB.push(member);
			}
		}
	}

	/**
	 * Called when all players are ready.
	 */
	private onFightReady(): void {
		this.readyWaiter = null;
		this.sendPacket(FightPackets.go);
		setTimeout(() => this.doNextTurn(this.getNextTurnMember()), 3000);
	}

	/**
	 * Called when all players are done with the turn.
	 */
	private onTurnReady(): void {
		if (this.isOneSideDead()) {
			this.endFight();
			return;
		}

		let turn = this.getNextTurnMember();
		this.sendPacket(FightPackets.turnContinue(turn.base.id));
		setTimeout(() => this.doNextTurn(turn), 1500);
	}

	/**
	 * Called when the fight should be ended.
	 */
	private endFight(): void {
		this.endWaiter = new TimedWaiter(() => this.onClosed(), this.players, 5000);
		this.sendPacket(FightPackets.end);

		for (let player of this.players.values()) {
			if (!player.client) continue;

			player.client.write(
				player.activePet ? PetPackets.attributes(player.activePet) : null,
				...MapPackets.mapData(player),
				MapPackets.npcList(player),
				MapPackets.enter,
				PlayerPackets.information(player),
			);

			// Clear all effects from fight members
			for (const member of this.members.values()) {
				// Clear all effects
				member.effect.value = 0;
				member.effectCounters.clear();
				member.effectData.clear();

				// Reset any modified stats to their base values
				member.base.fightStats.update(member.base);
			}

			// Only handle monster fight results
			if (this.fightType == FightType.Monster) {
				// Always calculate exp (gain or loss)
				this.onMapPlayerFightWin?.execute(createClientContext(player.client));
				player.onPlayerFightWin?.execute(createClientContext(player.client));

				// Additional rewards only for winners
				if (this.checkWinner(player)) {
					// START MODIFICATION
					let totalExp = 0;
					for (const enemy of this.sideB) {
						if (enemy.base instanceof Monster) {
							if (player.level.level - enemy.base.level > 19) continue;
							totalExp += enemy.base.rewards?.expBase ?? 0;
						}
					}

					if (totalExp > 0) {
						const levels = player.level.addExp(totalExp);

						if (levels === 0) player.client?.write(PlayerPackets.experience(player));
						else {
							player.fightData.stats.updateStatPointsForLevel(player.level.level);
							player.fightData.resist.updateResistForLevel(
								player.level.level,
								player.race,
								player.gender,
							);

							player.fightStats.update(player);
							const totals = player.fightStats.totals;
							player.fightData.stats.currentHp = totals.hp;
							player.fightData.stats.currentMp = totals.mp;

							player.client?.write(
								PlayerPackets.healHp(totals.hp),
								PlayerPackets.healMp(totals.mp),
								PlayerPackets.level(player),
								PlayerPackets.resist(player),
							);
						}

						const pet = player.activePet;

						if (pet) {
							const levels = pet.level.addExp(totalExp);

							if (levels === 0) player.client?.write(PetPackets.experience(pet));
							else {
								let oldSkills = pet.fightData.skills;
								let newSkills = Skills.fromJson(
									eligibleSkills(pet.skillList, pet.level.level),
								);
								// Only send packet if skills are new
								if (oldSkills !== newSkills) {
									pet.fightData.skills = newSkills;
									player.client?.write(PetPackets.skills(pet));
								}
								pet.fightData.stats.updateStatPointsForLevel(pet.level.level);

								// Heal pet on level up
								pet.fightStats.update(pet);
								pet.fightData.stats.currentHp = pet.fightStats.totals.hp;
								pet.fightData.stats.currentMp = pet.fightStats.totals.mp;

								player.client?.write(PetPackets.level(pet));
							}
						}
					}
					// END MODIFICATION

					// Apply pending skill experience if player won
					const member = this.members.get(player.id);
					if (member?.action.pendingSkillExp) {
						for (const skillGroup of player.fightData.skills.skillData) {
							if (skillGroup.id in member.action.pendingSkillExp) {
								let _ = skillGroup.addExp(
									member.action.pendingSkillExp[skillGroup.id],
									player.level.reborn,
								);
								player.client?.write(
									PlayerPackets.skillExperience(
										skillGroup.id,
										skillGroup.level,
										skillGroup.exp,
									),
								);
							}
						}
					}
				}
			}

			if (player.fightData.stats.currentHp === 0) {
				let point = new Point(290, 250).toMapPoint();
				let map = this.game.maps.get(1);

				// Leave party
				player.party?.removeMember(player.id);
				if (map) this.game.positionManager.onRequestMapChange(player, map, point);
			}
		}
	}

	/**
	 * Called when all players have called FightClosed.
	 */
	private onClosed(): void {
		for (let player of this.players) {
			player.fightData.currentFight = null;

			// Only proceed if this is a monster fight and the player won
			if (this.fightType == FightType.Monster && this.checkWinner(player) && player.client) {
				// Only execute for party leader or solo player
				if (!player.party || player.party.leader === player) {
					// Execute the fight's onFightClose action if it exists
					this.onFightClose?.execute(createClientContext(player.client));

					// Also execute the monster's onFightClose action if it exists
					for (const member of this.members.values()) {
						if (member.base instanceof Monster && member.base.onFightClose) {
							member.base.onFightClose.execute(createClientContext(player.client));
						}
					}
				}
			}
		}
		this.game.fights.delete(this);
	}

	/**
	 * Execute the next turn.
	 */
	private doNextTurn(member: FightMember): void {
		this.sendPacket(FightPackets.turnPause);
		member.nextTurn += 1;
		member.hasActed = true; // Mark this member as having acted this round

		if (member.base instanceof Monster) this.updateMonsterAction(member);

		member.doEffectTurn();

		let result;
		// TODO This will make them retreat instead of actually doing a death animation.
		// The member is dead, update the client
		if (member.effect.has(FightEffect.Dead)) {
			result = {
				type: 8,
				source: member.base.id,
				target: 0,
				stats: [member],
				magic: [],
			};
		} else {
			result = member.action.execute();
		}

		if (!result) {
			this.onTurnReady();
			return;
		}

		this.turnReadyWaiter = new TimedWaiter(() => this.onTurnReady(), this.players, 5000);
		this.sendPacket(FightPackets.actionResult(result));
	}

	/**
	 * Get the fight member whose turn it is.
	 */
	private getNextTurnMember(): FightMember {
		// Check if all members have acted this round
		const allMembersActedThisRound = [...this.sideA, ...this.sideB].every(
			member => member.hasActed || member.effect.has(FightEffect.Dead),
		);

		if (allMembersActedThisRound) {
			// Start a new round
			this.sortBySpeed();
		}

		let nextMember = this.sideA[0];
		let lowestTurn = nextMember.nextTurn;

		// Check all members in sideA
		for (const member of this.sideA) {
			if (member.effect.has(FightEffect.Dead) || member.hasActed) continue;
			if (member.nextTurn < lowestTurn) {
				nextMember = member;
				lowestTurn = member.nextTurn;
			}
		}

		// Check all members in sideB
		for (const member of this.sideB) {
			if (member.effect.has(FightEffect.Dead) || member.hasActed) continue;
			if (member.nextTurn < lowestTurn) {
				nextMember = member;
				lowestTurn = member.nextTurn;
			}
		}

		return nextMember;
	}

	/**
	 * Update what a monster will do.
	 * @param member
	 */
	private updateMonsterAction(member: FightMember): void {
		let targets = this.getSide(member, true).filter(t => !t.effect.has(FightEffect.Dead));
		
		// If no targets, do nothing
		if (targets.length === 0) {
			member.action.type = FightActionCommand.Defend; // Or some fallback
			return;
		}

		let target = targets[Math.floor(Math.random() * targets.length)];
		member.action.target = member.action.target || target; // Only set if not already set (though for monster it usually isn't)
		member.action.target = target; // Just force set it to be sure

		// Check if it's Felsworn Pet (ID 231) via base monster file or similar.
		// For now, let's just make sure it targets correctly.
		// The logic above picks a random target.

		// Ensure action target id is set correctly
		// member.action is FightAction
		
		// Check if monster has skills and 30% chance to use one
		if (member.base instanceof Monster && member.base.fightData.skills.skillData.length > 0 && Math.random() < 0.3) {
			// Pick a random skill? Or first one?
			// For simplicity:
			// member.action.type = FightActionCommand.Skill;
			// member.action.skill = ...
			
			// Current implementation seems incomplete in original code:
			member.action.type = FightActionCommand.Skill;
			// We need to set which skill to use!
			// If skill is not set, it might fail or crash or do nothing.
			
			const skills = member.base.fightData.skills.skillData;
			const skill = skills[Math.floor(Math.random() * skills.length)];
			if (skill) {
				member.action.skill = skill.id;
			} else {
				// Fallback if no skill found
				member.action.type = FightActionCommand.Melee;
			}

		} else {
			member.action.type = FightActionCommand.Melee;
		}
	}

	/**
	 * Check if all members on any side have died.
	 */
	private isOneSideDead(): boolean {
		let side1Alive = false;
		let side2Alive = false;

		for (let member of this.members.values()) {
			if (member.base.fightData.stats.currentHp === 0) continue;

			if (member.location < 10) side1Alive = true;
			else side2Alive = true;

			if (side1Alive && side2Alive) return false;
		}

		if (side1Alive) {
			this.winningSide = 10;
		} else if (side2Alive) {
			this.winningSide = 20;
		}

		return true;
	}

	/**
	 * Send packet to all players in the fight.
	 * @param packet
	 */
	public sendPacket(packet: Buffer | Packet): void {
		for (let player of this.players) player.client?.write(packet);
	}
}
