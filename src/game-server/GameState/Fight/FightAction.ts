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
import type { Fight } from './Fight';
import {
	calculateComboCount,
	executeMeleeAction,
	executeMeleeComboAction,
} from './FightActionMelee';
import type { FightActionResult } from './FightActionResultTypes';
import { FightActionSkill } from './FightActionSkill';
import type { FightMember } from './FightMember';

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
	public detail: number = 0;

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
				// Probably needs to be handled before we get to this class.
				return null;
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

	/**
	 * Execute a melee action.
	 */
	private executeMelee(): FightActionResult | null {
		if (!this.target || this.target.effect.any(FightEffect.Dead | FightEffect.Stun))
			return null;

		let combos = calculateComboCount(this.member);

		let data =
			combos === 1
				? executeMeleeAction(this.member, this.target)
				: executeMeleeComboAction(combos, this.member, this.target);

		// TODO use copy of hp in FightMember, update dead-status in setter
		if (this.target.base.fightData.stats.currentHp === 0)
			this.target.effect.value = FightEffect.Dead;

		let result: FightActionResult = {
			type: combos === 1 ? FightActionType.Melee : FightActionType.MeleeCombo,
			source: this.member.base.id,
			target: this.target.base.id,
			stats: [this.member, this.target],
			magic: [],
			data,
		};

		return result;
	}

	/**
	 * Execute a skill action.
	 */
	private executeSkill(): FightActionResult | null {
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
		let cost = Math.floor(skill.mp + skill.mpAdd * skillData.exp);

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

	/**
	 * Execute a use item action.
	 */
	private executeItem(): FightActionResult | null {
		if (!this.target) return null;

		// For players only - monsters can't use items
		if (!(this.member.base instanceof Player)) return null;

		// detail contains the inventory slot
		const item = this.member.base.items.inventory.get(this.detail);
		if (!item || item.type !== 2) return null; // Only allow consumable items (type 2)

		// Use the item - don't check return value since it's void
		this.member.base.items.useItemAndSend(this.detail);

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
		return null;
	}

	/**
	 * Execute a dodge action.
	 */
	private executeDodge(): FightActionResult | null {
		// TODO get actual percentage
		this.member.base.fightStats.totals.resists.dodgeAction =
			this.member.base.fightStats.totals.resists.dodgeAction * 0.25;
		return null;
	}

	/**
	 * Execute an escape action.
	 */
	private executeEscape(): FightActionResult | null {
		return null;
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
		// Only players can use items
		if (!(this.member.base instanceof Player)) {
			return null;
		}

		const inventory = this.member.base.items.inventory;

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
			this.member.base.items.useItemAndSend(bestHealSlot);

			return {
				type: FightActionType.Item,
				source: this.member.base.id,
				target: this.member.base.id,
				stats: [this.member],
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
		// Only players can use items
		if (!(this.member.base instanceof Player)) {
			return null;
		}

		const inventory = this.member.base.items.inventory;

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
			this.member.base.items.useItemAndSend(bestHealSlot);

			return {
				type: FightActionType.Item,
				source: this.member.base.id,
				target: this.member.base.id,
				stats: [this.member],
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
