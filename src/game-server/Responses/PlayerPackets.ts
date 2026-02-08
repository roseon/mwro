import type { Player } from '../GameState/Player/Player';
import { Packet } from '../PacketBuilder';
import { PacketType } from '../PacketType';
import { AttrsStruct } from './Structs/AttrsStruct';
import { ExpStruct } from './Structs/ExpStruct';
import { PlayerMiscStruct } from './Structs/PlayerMiscStruct';
import { PlayerSkillStruct } from './Structs/PlayerSkillStruct';
import { PlayerStatsStruct } from './Structs/PlayerStatsStruct';
import { ResistStruct } from './Structs/ResistStruct';
import { getTitleById } from '../Updater/Data/TitleData';

export abstract class PlayerPackets {
	/**
	 * Contains most information for the stats screen.
	 * @param player
	 */
	public static information(player: Player): Packet {
		let packet = new Packet(168, PacketType.PlayerInformation).uint16(6, 152);

		if (player.guild) packet.string(16, player.guild.name, 14);

		return packet
			.struct(32, AttrsStruct, player)
			.struct(60, ExpStruct, player.level)
			.uint32(72, player.file)
			.struct(76, PlayerStatsStruct, player)
			.struct(144, PlayerMiscStruct, player);
	}

	/**
	 * Result of using stats, updates attributes.
	 * @param player
	 */
	public static useStats(player: Player): Packet {
		return new Packet(60, PacketType.PlayerUseStats)
			.uint16(6, 44)
			.uint32(12, 1) // 1 = success, otherwise error
			.struct(16, AttrsStruct, player)
			.struct(44, ExpStruct, player.level)
			.uint32(56, player.file);
	}

	/**
	 * Used when player level changes, updates stats, exp.
	 * @param player
	 */
	public static level(player: Player): Packet {
		return new Packet(128, PacketType.PlayerLevel)
			.uint16(6, 112)
			.struct(16, PlayerStatsStruct, player)
			.struct(84, AttrsStruct, player)
			.struct(112, ExpStruct, player.level)
			.uint32(124, player.file);
	}

	/**
	 * Used when player exp changes.
	 * @param player
	 */
	public static experience(player: Player): Packet {
		return new Packet(28, PacketType.PlayerExperience)
			.uint16(6, 12)
			.struct(16, ExpStruct, player.level);
	}

	/**
	 * Sends the player's resist data.
	 * @param player
	 */
	public static resist(player: Player): Packet {
		return new Packet(76, PacketType.PlayerResist)
			.uint16(6, 60)
			.struct(16, ResistStruct, player.fightStats.totals.resists);
	}

	/**
	 * Updates player misc stats (reputation, etc.).
	 * @param player
	 */
	public static misc(player: Player): Packet {
		return new Packet(40, PacketType.PlayerMisc)
			.uint16(6, 24)
			.struct(16, PlayerMiscStruct, player);
	}

	/**
	 * Updates the player skill data.
	 * @param player
	 */
	public static skills(player: Player): Packet {
		let skills = player.fightData.skills.skillData;
		let packet = new Packet(16 + skills.length * 10, PacketType.PlayerSkills).uint32(
			12,
			skills.length,
		);

		for (let i = 0; i < skills.length; ++i)
			packet.struct(16 + i * 10, PlayerSkillStruct, skills[i]);

		return packet;
	}

	/**
	 * Updates the players skill experience.
	 * @param skillId
	 * @param level
	 * @param exp
	 * @returns
	 */
	public static skillExperience(skillId: number, level: number, exp: number): Packet {
		return new Packet(24, PacketType.PlayerSkillExp)
			.uint16(6, 8)
			.uint16(12, 1)
			.uint8(16, skillId)
			.uint16(18, level)
			.uint16(20, exp);
	}

	/**
	 * Updates the player's hp, will show an animation.
	 * @param currentHp
	 */
	public static healHp(currentHp: number): Packet {
		return new Packet(16, PacketType.PlayerHealHp).uint32(12, currentHp);
	}

	/**
	 * Updates the player's mp, will show an animation.
	 * @param currentMp
	 */
	public static healMp(currentMp: number): Packet {
		return new Packet(16, PacketType.PlayerHealMp).uint32(12, currentMp);
	}

	/**
	 * Sends the player's title list.
	 * @param player
	 */
	public static titleList(player: Player): Packet {
		// Get the player's titles by IDs
		const playerTitleIds = player.titles.titles;
		const availableTitles = playerTitleIds
			.map(id => getTitleById(id))
			.filter(title => title !== undefined);

		// Calculate packet size: 16 bytes for header + (70 bytes per title)
		const packetSize = 16 + availableTitles.length * 70;

		// Create packet with dynamic size
		const packet = new Packet(packetSize, PacketType.PlayerTitleList).uint16(
			6,
			packetSize - 16,
		); // Data size

		// Write the count of titles
		packet.uint16(12, availableTitles.length);

		// Current position tracker
		let currentPos = 16;

		// Write each title's data
		availableTitles.forEach((title, index) => {
			if (!title) return;

			packet
				.string(currentPos, title.name, 27) // Title name with padding
				.string(currentPos + 27, title.description, 41) // Description with padding
				.uint8(currentPos + 68, title.id); // Title ID

			currentPos += 70; // Move position for next title (27 + 41 + 1 + 1 byte alignment = 70)
		});

		return packet;
	}

	public static titleChange(player: Player): Packet {
		const activeTitle = player.titles.title ? getTitleById(player.titles.title) : null;

		return new Packet(44, PacketType.PlayerTitleChange)
			.uint16(6, 28)
			.uint16(12, player.id)
			.string(16, activeTitle ? activeTitle.name : '', 27);
	}

	public static titleHide(player: Player): Packet {
		return new Packet(16, PacketType.PlayerTitleHide).uint16(6, 4).uint16(12, player.id);
	}

	/**
	 * Sends a packet to add a single title to the player's collection.
	 * @param titleId The ID of the title to add
	 */
	public static titleAdd(titleId: number): Packet {
		const title = getTitleById(titleId);
		if (!title) return new Packet(0, PacketType.PlayerTitleSet);

		return new Packet(86, PacketType.PlayerTitleSet)
			.uint16(6, 70) // Data size
			.uint8(12, 1) // Amount of titles
			.string(16, title.name, 27) // Title name with padding
			.string(43, title.description, 41) // Description with padding
			.uint8(85, titleId); // Null terminator/alignment byte
	}

	/**
	 * Sends a packet when a player opens a vendor shop.
	 * @param vendorID
	 * @param vendorName
	 * @returns
	 */
	public static vendorOpen(vendorID: number, vendorName: string): Packet {
		return new Packet(32, PacketType.VendorOpen).uint16(12, vendorID).string(16, vendorName);
	}

	/**
	 * Sends a packet when a player closes a vendor shop.
	 * @param vendorID
	 * @returns
	 */
	public static vendorClose(vendorID: number): Packet {
		return new Packet(16, PacketType.VendorClose).uint16(12, vendorID);
	}

	/**
	 * Sends a packet when a player uses a shapeshift potion.
	 * @param player
	 * @param sspID The file ID of the shapeshift form, or 0 to revert to original form.
	 * @returns
	 */
	public static sspUse(player: Player, sspID: number): Packet {
		return new Packet(20, PacketType.SSPUse).uint16(12, player.id).uint16(16, sspID); //File ID
	}

	public static devilTears(player: Player): Packet {
		return new Packet(16, PacketType.DevilTearsUse).uint16(12, player.id);
	}
}
