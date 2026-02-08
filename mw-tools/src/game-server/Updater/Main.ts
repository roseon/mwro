import 'source-map-support/register';
import { BaseItemCollection } from '../Database/Collections/BaseItem/BaseItemCollection';
import { BaseQuestCollection } from '../Database/Collections/Quest/BaseQuestCollection';
import { GameDataCollection } from '../Database/Collections/GameData/GameDataCollection';
import { NpcCollection } from '../Database/Collections/Npc/NpcCollection';
import { Database } from '../Database/Database';
import type { ICluster } from '../Database/Interfaces/ICluster';
import { Logger, enableGlobalErrorCatching } from '../Logger/Logger';
import { ResourceManager } from '../ResourceManager/ResourceManager';
import { addResources } from '../Resources';
import { baseItemList } from './Data/BaseItemData';
import { mapDataList } from './Data/MapData';
import { npcDataList } from './Data/NpcData';
import { questDataList } from './Data/QuestData';
import { createBuckets, createCollections, createIndexes } from './Database/CreateDatabase';

enableGlobalErrorCatching();
addResources(['config']);

/**
 * Save map data to database.
 */
async function importMaps(): Promise<void> {
	let ref = await GameDataCollection.getInstance().getMaps();

	if (await ref.exists()) Logger.info('Maps already exist, overwriting.');

	await ref.upsert(mapDataList);
}

/**
 * Save NPC data to the database.
 */
async function importNpcs(): Promise<void> {
	let col = NpcCollection.getInstance();
	await Promise.all(npcDataList.map(async npc => col.upsertJson(npc.id.toString(), npc)));
}

/**
 * Save BaseItem data to the database.
 */
async function importBaseItems(): Promise<void> {
	let col = BaseItemCollection.getInstance();
	await Promise.all(baseItemList.map(async item => col.upsertJson(item.id.toString(), item)));
}

/**
 * Save Quest data to the database.
 */
async function importQuests(): Promise<void> {
	let col = BaseQuestCollection.getInstance();
	await Promise.all(questDataList.map(async quest => col.upsertJson(quest.id.toString(), quest)));
}

(async () => {
	await ResourceManager.load();
	let cluster = (): ICluster => Database.get().cluster;

	try {
		Logger.info('Creating buckets..');
		await Promise.all(await createBuckets());
		Logger.info(
			'The following buckets now exist:',
			(await (await cluster().buckets()).getAllBuckets()).map(b => b.name).join(', '),
		);

		await Database.reset();

		Logger.info('Creating collections..');
		await Promise.all(await createCollections());
		Logger.info(
			'The following collections now exist in the main bucket:',
			(await (await Database.get().mainBucket()).collections().getAllCollections())
				.map(b => b.name)
				.join(', '),
		);

		await Database.reset();

		Logger.info('Creating indexes');
		await Promise.all(await createIndexes());

		await Database.reset();

		//Logger.info('Importing maps...');
		//await importMaps();

		//Logger.info('Importing base items...');
		//await importBaseItems();

		//Logger.info('Importing quests...');
		//await importQuests();

		Logger.info('Done.');
	} catch (e: unknown) {
		Logger.info(e);
		Logger.info('Something went wrong, please try again.');
	}

	await cluster().close();
})();
