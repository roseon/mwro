import type { IBucket } from '../Interfaces/IBucket';
import type { ICollection } from '../Interfaces/ICollection';
import type { ICollectionManager } from '../Interfaces/ICollectionManager';
import { MySQLCluster } from './MySQLCluster';
import { MySQLCollection } from './MySQLCollection';
import { MySQLCollectionManager } from './MySQLCollectionManager';

export class MySQLBucket implements IBucket {
    constructor(private cluster: MySQLCluster, private name: string) {}

    public getCluster(): MySQLCluster {
        return this.cluster;
    }

    public getName(): string {
        return this.name;
    }

    public async collection(name: string, scope?: string | null): Promise<ICollection<unknown>> {
        return new MySQLCollection(this, name);
    }

    public collections(): ICollectionManager {
        return new MySQLCollectionManager(this);
    }
}
