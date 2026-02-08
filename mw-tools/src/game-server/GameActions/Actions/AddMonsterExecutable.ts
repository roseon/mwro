import { getConfig } from '../../Config/Config';
import { Monster } from '../../GameState/Monster/Monster';
import type { FightMember } from '../../GameState/Fight/FightMember';
import type { Player } from '../../GameState/Player/Player';
import { Logger } from '../../Logger/Logger';
import { Skills, eligibleSkills } from '../../GameState/Skills/Skills';
import { MessagePackets } from '../../Responses/MessagePackets';
import { PetPackets } from '../../Responses/PetPackets';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import type { ClientActionContext } from '../GameActionContext';
import { GameActionExecutable } from '../GameActionExecutable';
import type { GameActionMonster } from '../GameActionTypes';
import { MapID } from '../../Enums/MapID';

/**
 * Calculate how much exp to give based on level of monster, expBase and player level
 * If level difference between monster and player is to great then it will only reward 144 exp
 * @param player
 * @returns
 */
export function calculateMonsterExp(player: Player): number {
	if (!player.fightData.currentFight) {
		return 0;
	}
	
	// If player lost the fight (they're not the winner)
	if (player.fightData.currentFight.checkWinner(player) === false) {
		const expLoss = -Math.floor(player.level.nextLvlExp * 0.1);
		return expLoss;
	}


	// Calculate exp gain from monsters if player won
	let exp = 0;
	for (let monster of player.fightData.currentFight.sideB) {
		if (!(monster.base instanceof Monster)) continue;
		// Calculate base exp
		let tempExp = (monster.base.rewards?.expBase ?? 0) * (monster.base.level * 0.1);
		
		// Apply level difference scaling
		const levelDiff = player.level.level - monster.base.level;
		const optimalDiff = 3; // Maximum exp at 3 levels below player
		const scaleFactor = Math.max(0, 1 - Math.abs(levelDiff - optimalDiff) * 0.1);
		
		// Cap exp at 144 if level difference is too great
		if (Math.abs(levelDiff) > 10) {
			tempExp = 144;
		} else {
			tempExp = Math.floor(tempExp * scaleFactor);
		}

		exp += tempExp;
	}

	return exp * getConfig().modifiers.exp;
}

/**
 * Calculate how much gold to give based on level of monster, goldBase and player level
 * If level difference between monster and player is to great then it will only reward 144 gold
 * @param player
 * @returns
 */
export function calculateMonsterGold(player: Player): number {
	let gold = 0;

	// Only distribute gold if winner
	if (player.fightData.currentFight?.checkWinner(player)) {
		if (player.fightData.currentFight) {
			for (let monster of player.fightData.currentFight.sideB) {
				if (!(monster.base instanceof Monster)) continue;
				// TODO Generic formula
				let tempGold = monster.base.rewards?.goldBase ?? 0 * monster.base.level;
				if (Math.abs(monster.base.level - player.level.level) > 10 && tempGold > 144) {
					tempGold = 144;
				}
				gold += tempGold;
			}
		}
	}

	return gold * getConfig().modifiers.gold;
}

/**
 * Give exp and gold to the player and pet from monster kills.
 */
export class AddMonsterExecutable extends GameActionExecutable<ClientActionContext> {
	protected constructor(protected override readonly action: GameActionMonster) {
		super(action);
	}

	public static parse(action: GameActionMonster): AddMonsterExecutable {
		return new this(action);
	}

	protected run(context: ClientActionContext): void {
		// Floor exp/gold values to prevent long floating point numbers
		let gold = Math.floor(calculateMonsterGold(context.player));
		let exp = Math.floor(calculateMonsterExp(context.player));
		this.addGold(context.player, gold);
		this.addExp(context, exp);

		// Message player about their exp and gold gains
		let message: string | null = null;

		if (exp !== 0) {
			message = `${exp} exp`;
		}

		if (gold !== 0) {
			if (message) message = `${message} and ${gold} gold`;
			else message = `${gold} gold`;
		}

		// Message the player about their reward
		if (message)
			context.player.client?.write(MessagePackets.showMessage(`Recieved ${message}`));

		this.checkQuestDrops(context.player);
	}

	/**
	 * Check and distribute quest drops
	 * @param player 
	 */
	private checkQuestDrops(player: Player): void {
		// QuestId 1005: Stonesmith Quest
		const stonesmithQuest = player.quests.get(1005);
		if (stonesmithQuest && stonesmithQuest.stageIndex === 0) {
			// Only drop in Revive Arena
			if (player.mapData.map.id !== MapID.ReviveArena) return;

			// 40% chance to drop Lost Item (3000)
			if (Math.random() < 0.4) {
				const itemId = 3000;
				const baseItem = player.game.baseItems.get(itemId);

				if (baseItem) {
					// Add item and update client
					player.items.addItemAndSend(baseItem, 1);
					player.client?.write(MessagePackets.showMessage('You found a Lost Item!'));

					// Check if player has collected all 8 items
					if (player.items.getItemCount(3000) >= 8) {
						player.client?.write(MessagePackets.showMessage('You have collected all 8 items! Return to the Stonesmith.'));
					}
				}
			}
		}

		// QuestId 2000: Skill II Initiation
		const skillQuest = player.quests.get(2000);
		if (skillQuest && skillQuest.stageIndex === 0) {
			// Only drop in Revive Arena
			if (player.mapData.map.id !== MapID.ReviveArena) return;

			// 45% chance to drop Skill II Token (20007)
			if (Math.random() < 0.45) {
				const itemId = 20007;
				const baseItem = player.game.baseItems.get(itemId);

				if (baseItem) {
					// Only drop if player doesn't already have it
					if (player.items.getItemCount(itemId) > 0) return;
					player.items.addItemAndSend(baseItem, 1);
					player.client?.write(MessagePackets.showMessage('You found the Skill II Token!'));
				}
			}
		}
	}

	/**
	 * Distribute gold to the player
	 * @param player
	 */
	private addGold(player: Player, gold: number): void {
		if (gold !== 0) player.items.addGoldAndSend(gold);
	}

	/**
	 * Distribute exp to the player and pet
	 * @param context
	 */
	private addExp({ client, player }: ClientActionContext, exp: number): void {
		if (exp !== 0) {
			let pet = player.activePet;
			let petExp = 0;

			// Only give pet exp if player gained exp (not lost exp from death)
			if (pet && exp > 0) {
				petExp = exp * 2;

				let petLevels = pet.level.addExp(petExp);

				if (petLevels === 0) {
					client.write(PetPackets.experience(pet));
				} else {
					let oldSkills = pet.fightData.skills;
					let newSkills = Skills.fromJson(eligibleSkills(pet.skillList, pet.level.level));
					// Only send packet if skills are new
					if (oldSkills !== newSkills) {
						pet.fightData.skills = newSkills;
						client.write(PetPackets.skills(pet));
					}
					pet.fightData.stats.updateStatPointsForLevel(petLevels);
					if (petLevels > 0) {
						pet.fightData.stats.healHp();
						pet.fightData.stats.healMp();
					}
					client.write(PetPackets.level(pet));
				}
			}

			// Add exp to the player
			let playerLevels = player.level.addExp(exp);

			if (playerLevels === 0) {
				client.write(PlayerPackets.experience(player));
			} else {
				player.fightData.stats.updateStatPointsForLevel(playerLevels);
				if (playerLevels > 0) {
					player.fightData.stats.healHp();
					player.fightData.stats.healMp();
				}
				if (player.level.level >= 20 && !player.quests.has(2000)) {
					try {
						player.quests.addAndSend(2000);
					} catch {
						// Ignore quest add errors
					}
				}
				if (player.level.level >= 50 && !player.quests.has(60002)) {
					try {
						player.quests.addAndSend(60002);
					} catch {
						// Ignore quest add errors
					}
				}
				player.fightStats.update(player);
				client.write(PlayerPackets.level(player));
				client.write(PlayerPackets.information(player));
			}
		}
	}
}
