import { getConfig } from '../../Config/Config';
import { skillProperties } from '../../Data/SkillProperties';
import { FightActionCommand } from '../../Enums/FightActionCommand';
import { FightActionType } from '../../Enums/FightActionType';
import { FightEffect } from '../../Enums/FightEffect';
import { Logger } from '../../Logger/Logger';
import { PlayerPackets } from '../../Responses/PlayerPackets';
import { Random } from '../../Utils/Random';
import { ItemType } from '../Item/ItemType';
import { Player } from '../Player/Player';
import { Pet } from '../Pet/Pet';
import { SkillsGroup } from '../Skills/SkillsGroup';
import type { Fight } from './Fight';
import {
	calculateComboCount,
	executeMeleeAction,
	executeMeleeComboAction,
} from './FightActionMelee';
import type { FightActionResult } from './FightActionResultTypes';
import { PetPackets } from '../../Responses/PetPackets';
import { FightActionSkill } from './FightActionSkill';
import { FightMember } from './FightMember';
import { FightPackets } from '../../Responses/FightPackets';

/**
 * FightAction has 1:1 relation to FightMember.
 * Holds what the player wants to do on their next turn.
 */
export class FightAction {
	/**
	 * The main fight command.
	 */
	public type: FightActionCommand = FightActionCommand.Melee;

	/**
	 * The character being targeted.
	 */
	public target: FightMember | null = null;

	/**
	 * Action detail. Can be skill id, item slot, or defended id.
	 */
	public __detail: number = 0;
	public get detail(): number {
		return this.__detail;
	}
	public set detail(value: number) {
		this.__detail = value;
	}
	// Helper setter for cleaner code elsewhere, though detail is generic
	public set skill(id: number) {
		this.__detail = id;
	}

	/**
	 * Whether this action should auto-pick a target.
	 */
	public autoTarget: boolean = true;

	/**
	 * Track amount of exp to add to skills
	 */
	public pendingSkillExp: Record<number, number> = {};

	public constructor(
		public readonly fight: Fight,
		public readonly member: FightMember,
	) {}

	/**
	 * Executes this action.
	 * @param fight
	 */
	public execute(): FightActionResult | null {
		if (this.member.effect.any(FightEffect.Dead | FightEffect.Stun)) return null;

		if (this.member.effect.has(FightEffect.Chaos)) this.executeChaossedAttack();
		if (this.member.effect.has(FightEffect.Hypnotize)) this.executeHypnotizedAttack();

		/**
		 * Reset dodgeAction stat to 0 and have the executeDodge reapply
		 * Makes it so it is only active when in dodge mode
		 */
		this.member.base.fightStats.totals.resists.dodgeAction = 0;

		switch (this.type) {
			case FightActionCommand.Melee:
				return this.executeMelee();
			case FightActionCommand.Skill:
				return this.executeSkill();
			case FightActionCommand.Item:
				return this.executeItem();
			case FightActionCommand.Defend:
				return this.executeDefend();
			case FightActionCommand.Dodge:
				return this.executeDodge();
			case FightActionCommand.Escape:
				return this.executeEscape();
			case FightActionCommand.ChangePet:
				return this.executeChangePet();
			case FightActionCommand.HP:
				return this.executeHP();
			case FightActionCommand.MP:
				return this.executeMP();
			case FightActionCommand.Auto:
				const base = this.member.base;
				let lastAction = null;
				let lastTargetId = null;

				if (base instanceof Player) {
					lastAction = base.fightData.lastAction;
					lastTargetId = base.fightData.lastTargetId;
				} else if (base instanceof Pet) {
					lastAction = base.fightData.lastAction;
					lastTargetId = base.fightData.lastTargetId;
				}

				if (lastAction) {
					this.type = lastAction.type;
					this.detail = lastAction.detail;

					if (lastTargetId) {
						this.target = this.fight.members.get(lastTargetId) ?? null;
					}

					// If no target or target is dead, enable auto targeting
					if (!this.target || this.target.effect.any(FightEffect.Dead | FightEffect.Stun)) {
						this.target = null;
						this.autoTarget = true;
					}

					// Prevent infinite recursion if last action was Auto
					if (this.type === FightActionCommand.Auto) {
						this.type = FightActionCommand.Melee;
					}

					return this.execute();
				}

				this.type = FightActionCommand.Melee;
				this.autoTarget = true;
				return this.executeMelee();
			default:
				return null;
		}
	}

	/**
	 * Set the target of this action by id.
	 * @param id
	 */
	public setTarget(id: number): void {
		this.target = this.fight.members.get(id) ?? null;
	}

	private saveLastAction(): void {
		const base = this.member.base;
		if (base instanceof Player) {
			base.fightData.lastAction = { type: this.type, detail: this.detail };
			base.fightData.lastTargetId = this.target?.base.id ?? null;
		} else if (base instanceof Pet) {
			base.fightData.lastAction = { type: this.type, detail: this.detail };
			base.fightData.lastTargetId = this.target?.base.id ?? null;
		}
	}

	/**
	 * Execute a melee action.
	 */
	private executeMelee(): FightActionResult | null {
		this.ensureTarget();
		this.saveLastAction();

		if (!this.target || this.target.effect.any(FightEffect.Dead | FightEffect.Stun))
			return null;

		const originalTarget = this.target;
		const resolvedTarget = this.resolveDefendTarget(originalTarget);
		const protectId =
			resolvedTarget.base.id !== originalTarget.base.id
				? resolvedTarget.base.id
				: 0;

		let combos = calculateComboCount(this.member);

		let data =
			combos === 1
				? executeMeleeAction(this.member, resolvedTarget, protectId)
				: executeMeleeComboAction(combos, this.member, resolvedTarget);

		// TODO use copy of hp in FightMember, update dead-status in setter
		resolvedTarget.isDead();

		let result: FightActionResult = {
			type: combos === 1 ? FightActionType.Melee : FightActionType.MeleeCombo,
			source: this.member.base.id,
			target: originalTarget.base.id,
			stats: [this.member, resolvedTarget],
			magic: [],
			data,
		};

		return result;
	}

	/**
	 * Execute a skill action.
	 */
	private executeSkill(): FightActionResult | null {
		this.ensureTarget();
		this.saveLastAction();

		if (!this.target) return null;

		// For monsters, randomly select a skill from their available skills
		let skillData =
			this.member.base instanceof Player
				? this.member.base.fightData.skills.skillData.find(s => s.id === this.detail)
				: Number(this.member.base.level) < 50
					? this.member.base.fightData.skills.skillData[
							Math.floor(
								Math.random() *
									Math.min(2, this.member.base.fightData.skills.skillData.length),
							)
						]
					: this.member.base.fightData.skills.skillData[
							Math.floor(
								Math.random() * this.member.base.fightData.skills.skillData.length,
							)
						];

		// Set the detail property for monsters
		if (!(this.member.base instanceof Player) && skillData) {
			this.detail = skillData.id;
		}

		if (!skillData) return null;

		let skill = skillProperties[skillData.id];
		let cost = Math.floor(skill.mp + skill.mpAdd * skillData.level);

		if (cost > this.member.base.fightData.stats.currentMp) return null;

		this.member.base.fightData.stats.addMp(-cost);

		const result = FightActionSkill.execute(this, skillData);

		// Track pending experience gain only for players
		if (result && this.member.base instanceof Player) {
			if (!this.pendingSkillExp[skillData.id]) {
				this.pendingSkillExp[skillData.id] = 0;
			}
			this.pendingSkillExp[skillData.id] += 1;
		}

		return result;
	}

	public ensureTarget(): boolean {
		if (this.ensureTargetValid()) {
			return true;
		}

		if (!this.autoTarget) return false;

		const side = this.fight.getSide(this.member, true);
		const liveTargets = side.filter(t => !t.effect.any(FightEffect.Dead));
		this.target = liveTargets.length > 0 ? liveTargets[0] : null;
		return this.target !== null;
	}

	private ensureTargetValid(): boolean {
		return !!(this.target && !this.target.effect.any(FightEffect.Dead | FightEffect.Stun));
	}

	public resolveDefendTarget(target: FightMember): FightMember {
		if (!target.effect.has(FightEffect.Defend)) return target;

		const protectorId = target.effectData.get(FightEffect.Defend);
		if (!protectorId || protectorId === target.base.id) return target;

		const protector = this.fight.members.get(protectorId) ?? null;
		if (!protector || protector.effect.has(FightEffect.Dead)) return target;

		return protector;
	}

	/**
	 * Execute a use item action.
	 */
	private executeItem(): FightActionResult | null {
		if (!this.target) {
			this.target = this.member;
		}
		if (!this.target) return null;

		// For players/pets only - monsters can't use items
		let owner: Player | null = null;
		if (this.member.base instanceof Player) {
			owner = this.member.base;
		} else if (this.member.base instanceof Pet) {
			owner =
				[...this.fight.players].find(
					player => player.activePet && player.activePet.id === this.member.base.id,
				) ?? null;
		}
		if (!owner) return null;

		// detail contains the inventory slot (fallback to item id if needed)
		let itemIndex = this.detail;
		if (itemIndex >= 0x01000000) {
			itemIndex -= 0x01000000;
		}

		let item = null;
		// Assume slot if within inventory bounds
		if (itemIndex < owner.items.inventory.maxSize) {
			item = owner.items.inventory.get(itemIndex);
		}

		if (!item) {
			for (const [slot, invItem] of owner.items.inventory.entries()) {
				if (invItem && invItem.base.id === this.detail) {
					itemIndex = slot;
					item = invItem;
					break;
				}
			}
		}
		if (!item || item.type !== 2) return null; // Only allow consumable items (type 2)

		const targetBase = this.target.base;
		const healAction = (item.action as unknown as {
			action?: { hp?: number; mp?: number; isPerc?: boolean };
		})?.action;
		const isHealAction = !!(healAction && (healAction.hp || healAction.mp));

		if (targetBase instanceof Pet && isHealAction) {
			if (!healAction) return null;

			const petTarget = targetBase as Pet;
			const stats = petTarget.fightData.stats;
			const totals = petTarget.fightStats.totals;
			if (healAction.isPerc) {
				if (healAction.hp) stats.addHpPerc(healAction.hp, totals.hp);
				if (healAction.mp) stats.addMpPerc(healAction.mp, totals.mp);
			} else {
				if (healAction.hp) stats.addHp(healAction.hp, totals.hp);
				if (healAction.mp) stats.addMp(healAction.mp, totals.mp);
			}

			if (healAction.hp) {
				owner.client?.write(PetPackets.healHp(petTarget));
			}
			if (healAction.mp) {
				owner.client?.write(PetPackets.healMp(petTarget));
			}

			owner.items.reduceItem(itemIndex);
			return {
				type: FightActionType.Item,
				source: this.member.base.id,
				target: targetBase.id,
				stats: [this.target],
				magic: [],
				data: Buffer.alloc(0),
			};
		}

		if (targetBase instanceof Player && isHealAction) {
			if (!healAction) return null;

			const playerTarget = targetBase as Player;
			const stats = playerTarget.fightData.stats;
			const totals = playerTarget.fightStats.totals;
			if (healAction.isPerc) {
				if (healAction.hp) stats.addHpPerc(healAction.hp, totals.hp);
				if (healAction.mp) stats.addMpPerc(healAction.mp, totals.mp);
			} else {
				if (healAction.hp) stats.addHp(healAction.hp, totals.hp);
				if (healAction.mp) stats.addMp(healAction.mp, totals.mp);
			}

			if (healAction.hp) {
				playerTarget.client?.write(PlayerPackets.healHp(stats.currentHp));
			}
			if (healAction.mp) {
				playerTarget.client?.write(PlayerPackets.healMp(stats.currentMp));
			}
			owner.items.reduceItem(itemIndex);
			return {
				type: FightActionType.Item,
				source: this.member.base.id,
				target: playerTarget.id,
				stats: [this.target],
				magic: [],
				data: Buffer.alloc(0),
			};
		}

		// Use the item - don't check return value since it's void
		owner.items.useItemAndSend(itemIndex);

		return {
			type: FightActionType.Item,
			source: this.member.base.id,
			target: this.target.base.id,
			stats: [this.target], // Only target's stats change when using healing items
			magic: [],
			data: Buffer.alloc(0), // No additional data needed for items
		};
	}

	/**
	 * Execute a defend action.
	 */
	private executeDefend(): FightActionResult | null {
		if (!this.target && this.detail) {
			this.target = this.fight.members.get(this.detail) ?? null;
		}
		if (!this.target) {
			this.target = this.member;
		}

		this.saveLastAction();

		if (!this.target || this.target.effect.any(FightEffect.Dead | FightEffect.Stun)) {
			return null;
		}

		const allies = this.fight.getSide(this.member, false);
		if (!allies.includes(this.target)) {
			this.target = this.member;
		}

		this.target.effect.add(FightEffect.Defend);
		this.target.effectCounters.set(FightEffect.Defend, 2);
		this.target.effectData.set(FightEffect.Defend, this.member.base.id);
		this.fight.sendPacket(
			FightPackets.status([
				{ id: this.target.base.id, status: this.target.effect.value, hp: 0 },
			]),
		);

		return null;
	}

	/**
	 * Execute a dodge action.
	 */
	private executeDodge(): FightActionResult | null {
		this.saveLastAction();

		// TODO get actual percentage
		this.member.base.fightStats.totals.resists.dodgeAction =
			this.member.base.fightStats.totals.resists.dodgeAction * 0.25;
		return null;
	}

	/**
	 * Execute an escape action.
	 */
	private executeEscape(): FightActionResult | null {
		const success = Random.chance(0.8);

		return {
			type: FightActionType.Escape,
			source: this.member.base.id,
			target: 0,
			stats: [this.member],
			magic: [],
			data: Buffer.from([success ? 1 : 0]),
		};
	}

	/**
	 * Execute a change pet action.
	 */
	private executeChangePet(): FightActionResult | null {
		return null;
	}

	/**
	 * Execute a use hp potion action.
	 */
	private executeHP(): FightActionResult | null {
		let owner: Player | null = null;
		if (this.member.base instanceof Player) {
			owner = this.member.base;
		} else if (this.member.base instanceof Pet) {
			owner =
				[...this.fight.players].find(
					player => player.activePet && player.activePet.id === this.member.base.id,
				) ?? null;
		}

		if (!owner) {
			return null;
		}

		if (!this.target) this.target = this.member;

		const inventory = owner.items.inventory;

		// Type guard for HealExecutable
		const isHPHealingItem = (action: any): boolean => {
			if (!action) return false;
			if (action.constructor.name !== 'HealExecutable') return false;
			const healAction = (action as any).action;
			return healAction && typeof healAction.hp === 'number' && healAction.hp > 0;
		};

		let bestHealSlot = -1;
		let maxHealAmount = 0;

		// Find the item with highest healing value
		for (let i = 0; i < inventory.maxSize; i++) {
			const item = inventory.get(i);
			if (!item) continue;

			if (item.type === ItemType.Consumable && item.action && isHPHealingItem(item.action)) {
				const healAmount = (item.action as any).action.hp;

				if (healAmount > maxHealAmount) {
					maxHealAmount = healAmount;
					bestHealSlot = i;
				}
			}
		}

		// Use the best healing item if found
		if (bestHealSlot !== -1) {
			const item = inventory.get(bestHealSlot);
			const healAction = (item!.action as any).action;

			let stats, totals;

			if (this.target.base instanceof Player) {
				stats = this.target.base.fightData.stats;
				totals = this.target.base.fightStats.totals;
			} else if (this.target.base instanceof Pet) {
				stats = this.target.base.fightData.stats;
				totals = this.target.base.fightStats.totals;
			} else {
				return null;
			}

			if (healAction.isPerc) {
				if (healAction.hp) stats.addHpPerc(healAction.hp, totals.hp);
				if (healAction.mp) stats.addMpPerc(healAction.mp, totals.mp);
			} else {
				if (healAction.hp) stats.addHp(healAction.hp, totals.hp);
				if (healAction.mp) stats.addMp(healAction.mp, totals.mp);
			}

			if (this.target.base instanceof Player) {
				if (healAction.hp) {
					this.target.base.client?.write(PlayerPackets.healHp(stats.currentHp));
				}
				if (healAction.mp) {
					this.target.base.client?.write(PlayerPackets.healMp(stats.currentMp));
				}
			} else if (this.target.base instanceof Pet) {
				if (healAction.hp) {
					owner.client?.write(PetPackets.healHp(this.target.base));
				}
				if (healAction.mp) {
					owner.client?.write(PetPackets.healMp(this.target.base));
				}
			}

			owner.items.reduceItem(bestHealSlot);

			return {
				type: FightActionType.Item,
				source: this.member.base.id,
				target: this.target.base.id,
				stats: [this.target],
				magic: [],
				data: Buffer.alloc(0),
			};
		}
		return null;
	}

	/**
	 * Execute a use mp potion action.
	 */
	private executeMP(): FightActionResult | null {
		let owner: Player | null = null;
		if (this.member.base instanceof Player) {
			owner = this.member.base;
		} else if (this.member.base instanceof Pet) {
			owner =
				[...this.fight.players].find(
					player => player.activePet && player.activePet.id === this.member.base.id,
				) ?? null;
		}

		if (!owner) {
			return null;
		}

		if (!this.target) this.target = this.member;

		const inventory = owner.items.inventory;

		// Type guard for HealExecutable
		const isMPHealingItem = (action: any): boolean => {
			if (!action) return false;
			if (action.constructor.name !== 'HealExecutable') return false;
			const healAction = (action as any).action;
			return healAction && typeof healAction.mp === 'number' && healAction.mp > 0;
		};

		let bestHealSlot = -1;
		let maxHealAmount = 0;

		// Find the item with highest healing value
		for (let i = 0; i < inventory.maxSize; i++) {
			const item = inventory.get(i);
			if (!item) continue;

			if (item.type === ItemType.Consumable && item.action && isMPHealingItem(item.action)) {
				const healAmount = (item.action as any).action.mp;

				if (healAmount > maxHealAmount) {
					maxHealAmount = healAmount;
					bestHealSlot = i;
				}
			}
		}

		// Use the best healing item if found
		if (bestHealSlot !== -1) {
			const item = inventory.get(bestHealSlot);
			const healAction = (item!.action as any).action;

			let stats, totals;

			if (this.target.base instanceof Player) {
				stats = this.target.base.fightData.stats;
				totals = this.target.base.fightStats.totals;
			} else if (this.target.base instanceof Pet) {
				stats = this.target.base.fightData.stats;
				totals = this.target.base.fightStats.totals;
			} else {
				return null;
			}

			if (healAction.isPerc) {
				if (healAction.hp) stats.addHpPerc(healAction.hp, totals.hp);
				if (healAction.mp) stats.addMpPerc(healAction.mp, totals.mp);
			} else {
				if (healAction.hp) stats.addHp(healAction.hp, totals.hp);
				if (healAction.mp) stats.addMp(healAction.mp, totals.mp);
			}

			if (this.target.base instanceof Player) {
				if (healAction.hp) {
					this.target.base.client?.write(PlayerPackets.healHp(stats.currentHp));
				}
				if (healAction.mp) {
					this.target.base.client?.write(PlayerPackets.healMp(stats.currentMp));
				}
			} else if (this.target.base instanceof Pet) {
				if (healAction.hp) {
					owner.client?.write(PetPackets.healHp(this.target.base));
				}
				if (healAction.mp) {
					owner.client?.write(PetPackets.healMp(this.target.base));
				}
			}

			owner.items.reduceItem(bestHealSlot);

			return {
				type: FightActionType.Item,
				source: this.member.base.id,
				target: this.target.base.id,
				stats: [this.target],
				magic: [],
				data: Buffer.alloc(0),
			};
		}
		return null;
	}

	/**
	 * The character is under the effect of chaos.
	 */
	private executeChaossedAttack(): void {
		let chance = 0.6;

		//TODO Chaos resistance

		// target teamates
		let targets = this.fight
			.getSide(this.member, !Random.chance(chance))
			.filter(t => !t.effect.any(FightEffect.Dead | FightEffect.Stun));
		let target = targets[Random.int(0, targets.length)];

		this.target = target;

		// Always set action to melee
		this.type = FightActionCommand.Melee;
	}

	private executeHypnotizedAttack(): void {
		// When hypnotized, clear target and set type to melee
		// This will effectively make them miss their turn since execute()
		// checks for hypnotize effect before doing anything
		this.target = null;
		this.type = FightActionCommand.Melee;
	}

	/**
	 * Specifies targets for the skill?
	 * @param targets [id, index][]
	 */
	private getDataSkill(targets: [number, number][]): Buffer {
		let data = Buffer.alloc(1 + targets.length * 5);
		data.writeUInt8(targets.length);

		for (let i = 0; i < targets.length; ++i) {
			let offset = 1 + i * 5;
			data.writeUInt32LE(targets[i][0], offset);
			data.writeUInt8(targets[i][1], offset + 4);
		}

		return data;
	}
}
