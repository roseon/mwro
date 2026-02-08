import { Database } from '../Database';
import { ResourceManager } from '../../ResourceManager/ResourceManager';
import { addAllResources } from '../../Resources';

async function init() {
    console.log('Loading configuration...');
    addAllResources();
    await ResourceManager.load();

    console.log('Initializing MySQL Database...');
    const db = Database.get();
    
    // Ensure we are using MySQL
    if (db.cluster.constructor.name !== 'MySQLCluster') {
        console.error('Database type is not MySQL. Please check valid configuration is provided and loaded.');
        // We continue anyway, maybe the user wants to test
    }

    // Create database first
    const bucketManager = await db.cluster.buckets();
    console.log('Creating database MythWarServer if not exists...');
    await bucketManager.createBucket({ name: 'MythWarServer' } as any);

    // This creates the collections (tables)
    const bucket = await db.cluster.bucket('MythWarServer');
    const manager = bucket.collections();
    
    // List of collections to create
    // These correspond to the table names
    const collections = [
        'User',
        'Player', 
        'BaseItem', 
        'BasePet',
        'BaseQuest', 
        'Condition', 
        'Action',
        'Npc', 
        'Monster',
        'GameData'
    ];

    for (const name of collections) {
         console.log(`Creating collection ${name}...`);
         await manager.createCollection({ name: name, scopeName: '_default' });
    }
    
    console.log('Database initialized.');
    process.exit(0);
}

init().catch((err) => {
    console.error(err);
    process.exit(1);
});
