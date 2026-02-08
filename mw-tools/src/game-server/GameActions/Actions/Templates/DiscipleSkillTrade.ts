import type { ClientActionContext } from '../../GameActionContext';
import { NpcSayExecutable } from '../NpcSayExecutable';
import { MessagePackets } from '../../../Responses/MessagePackets';
import { PlayerPackets } from '../../../Responses/PlayerPackets';
import { ItemPackets } from '../../../Responses/ItemPackets';
import type { GameActionNpcOption, GameActionTemplate } from '../../GameActionTypes';
import { Logger } from '../../../Logger/Logger';

export function discipleSkillTrade(context: ClientActionContext, params?: Record<string, unknown>): void {
	try {
		const { player, client } = context;
		const mokkaId = 3001;
		const pointsPerMokka = 120;
		const skillCap = 4200;

		// If skillId is provided, perform trade
		if (params && typeof params.skillId === 'number') {
			const skillId = params.skillId;
			const skill = player.fightData.skills.skillData.find(s => s.id === skillId);

			if (!skill) {
				client.write(MessagePackets.showMessage('Skill not found.'));
				return;
			}

			if (skill.exp >= skillCap) {
				client.write(MessagePackets.showMessage('This skill is already at or above the cap.'));
				return;
			}

			// Remove Item
			let slot = -1;
			// First try finding by ID
			for (const [s, item] of player.items.inventory.entries()) {
				if (item.base.id === mokkaId) {
					slot = s;
					break;
				}
			}
			
			// Fallback: Check for item name if ID not found
			if (slot === -1) {
				for (const [s, item] of player.items.inventory.entries()) {
					// Use exact match to avoid matching "Mokka's Short Sword"
					if (item.base.name === 'Mokka') {
						slot = s;
						break;
					}
				}
			}
			
			if (slot !== -1) {
				let item = player.items.inventory.get(slot);
				if (item) {
					if (item.locked) {
						client.write(MessagePackets.showMessage('Item is locked.'));
						return;
					}

					if (item.count > 1) {
						item.count--;
						client.write(ItemPackets.change([[slot, item]]));
					} else {
						player.items.removeSlotAndSend(slot);
						// Send full inventory update to prevent ghost items (client-side desync)
						client.write(ItemPackets.inventory(player.items.inventory));

						// Verify item was consumed/removed for single item case
						const itemAfter = player.items.inventory.get(slot);
						if (itemAfter && itemAfter.base.id === item.base.id) {
							// Item was NOT removed (e.g. maybe it was treated as a Quest item?)
							client.write(MessagePackets.showMessage('Could not consume item.'));
							return;
						}
					}
					
					// Add Skill Points
					let added = Math.min(pointsPerMokka, skillCap - skill.exp);
					player.fightData.skills.addSkill(skillId, skill.exp + added); 
					
					// Send updates
					client.write(MessagePackets.showMessage(`Added ${added} points to skill ${skill.id}.`));
					client.write(PlayerPackets.skills(player));

					// Re-open dialog
					discipleSkillTrade(context);
				}
			} else {
				client.write(MessagePackets.showMessage('You do not have any Mokka.'));
			}
			return;
		}

		// Show Dialog
		const options: GameActionNpcOption[] = player.fightData.skills.skillData
			.filter(skill => skill.exp < skillCap)
			.map(skill => {
				const action: GameActionTemplate = {
					type: 'template',
					template: 'discipleSkillTrade',
					params: { skillId: skill.id }
				};
				return {
					text: `#gSkill ${skill.id} (${skill.exp}/${skillCap})#e`,
					action: action as any
				};
			});

		if (options.length === 0) {
			NpcSayExecutable.parse({
				type: 'npcSay',
				message: "All your skills are maxed out!"
			}).execute(context);
			return;
		}

		options.push({ text: "I'm done." });

		NpcSayExecutable.parse({
			type: 'npcSay',
			message: 'Which skill would you like to upgrade? (1 Mokka = 120 points)',
			options: options
		}).execute(context);
	} catch (error) {
		Logger.error('Error in discipleSkillTrade:', error);
	}
}
