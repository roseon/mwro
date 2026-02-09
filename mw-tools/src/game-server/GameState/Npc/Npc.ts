import { NpcType, type NpcJson } from '../../Database/Collections/Npc/NpcJson';
import type { ClientActionContext } from '../../GameActions/GameActionContext';
import { createClientContext } from '../../GameActions/GameActionContext';
import type { GameActionExecutable } from '../../GameActions/GameActionExecutable';
import { GameActionParser } from '../../GameActions/GameActionParser';
import type { GameConnection, PlayerConnection } from '../../Server/Game/GameConnection';
import { Individual } from '../Individual/Individual';
import type { GameMap } from '../Map/GameMap';
import { NpcMapData } from './NpcMapData';
import { ShopPackets } from '../../Responses/ShopPackets';

// NPC IDs must be in the 0x80000000 range.
export class Npc extends Individual {
	public fightData: null = null;

	public mapData: NpcMapData;

	public action: GameActionExecutable<ClientActionContext> | null = null;

	public giveaction: GameActionExecutable<ClientActionContext> | null = null;

	public type: number | undefined;

	public forge: boolean | undefined;

	public spawnByDefault: boolean;

	public spawnTime?: string;

	public constructor(json: NpcJson, maps: Map<number, GameMap>) {
		super(json);
		this.mapData = new NpcMapData(json, maps);
		this.action = GameActionParser.parse(json.action);
		this.giveaction = GameActionParser.parse(json.giveaction);
		this.type = json.type;
		this.spawnByDefault = json.spawnByDefault ?? true;
		this.spawnTime = json.spawnTime;
	}

	/**
	 * Called when the client talks to this npc.
	 * @param client
	 */
	public onTalk(client: GameConnection): void {
		if (!client.hasPlayer()) return;

		client.player.memory.activeNpc = this;
		if (this.type === NpcType.Buyer || this.name.toLowerCase() === 'buyer') {
			client.write(ShopPackets.npcBuyer());
			return;
		}
		this.action?.execute(createClientContext(client));
	}

	/**
	 * Called when the client gives items to this npc.
	 * @param client
	 */
	public onGive(client: GameConnection): void {
		if (!client.hasPlayer()) return;

		client.player.memory.activeNpc = this;
		this.giveaction?.execute(createClientContext(client));
	}

	/**
	 * Called when the client closes a dialog window.
	 * @param client
	 * @param option
	 */
	public onCloseDialog(client: PlayerConnection, option: number): void {
		if (client.player.memory.activeNpc !== this) return;

		let npcOption = client.player.memory.npcOptions?.[option];
		client.player.memory.npcOptions = null;
		npcOption?.execute(createClientContext(client));
	}

	public spawnByTime(): boolean {
		if (!this.spawnTime) return true;

		const now = new Date();
		const [hours, minutes] = this.spawnTime.split(':').map(Number);
		const currentMinutes = now.getHours() * 60 + now.getMinutes();
		const spawnMinutes = hours * 60 + minutes;

		// Check if the current time is past the spawn time
		const shouldSpawn = currentMinutes >= spawnMinutes;

		return shouldSpawn;
	}
}
