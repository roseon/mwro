import type { IKeyReference } from '../Interfaces/IKeyReference';
import { MySQLCollection } from './MySQLCollection';

export class MySQLKeyReference<T> implements IKeyReference<T> {
    constructor(private collection: MySQLCollection<T>, private key: string) {}

    public async get(): Promise<T> {
        return this.collection.get(this.key);
    }

    public async upsert(value: T): Promise<void> {
        return this.collection.upsert(this.key, value);
    }

    public async remove(): Promise<void> {
        return this.collection.remove(this.key);
    }

    public async exists(): Promise<boolean> {
        return this.collection.exists(this.key);
    }
}
