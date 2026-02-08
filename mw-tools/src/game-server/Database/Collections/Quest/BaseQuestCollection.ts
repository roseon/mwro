import { BaseCollection } from '../BaseCollection';
import type { BaseQuest, BaseQuestStage } from '../../../GameState/Quest/BaseQuest';

export type BaseQuestJson = {
    id: number;
    clientId: number;
    name: string; // Added for reference
    description: string; // Added for reference
    stages: { [key: number]: { situation: string; requirements: string; reward: string } };
};

export class BaseQuestCollection extends BaseCollection<BaseQuest, BaseQuestJson> {
    private static instance: BaseQuestCollection | null = null;

    protected constructor() {
        super('BaseQuest'); // Must match collection name in Collections.ts
    }

    public static getInstance(): BaseQuestCollection {
        if (this.instance === null) this.instance = new BaseQuestCollection();

        return this.instance;
    }

    public getKey(obj: BaseQuest): string {
        return obj.id.toString();
    }

    protected toJson(obj: BaseQuest): BaseQuestJson {
        const stages: { [key: number]: { situation: string; requirements: string; reward: string } } = {};
        obj.stages.forEach((val: BaseQuestStage, key: number) => {
            stages[key] = { situation: val.situation, requirements: val.requirements, reward: val.reward };
        });
        
        // Note: name and description are not in BaseQuest type currently, 
        // so we might lose them if we round-trip without updating generic BaseQuest type.
        // For now, this is for loading FROM json.
        return {
            id: obj.id,
            clientId: obj.clientId,
            name: '', 
            description: '',
            stages
        };
    }

    protected fromJson(json: BaseQuestJson): BaseQuest {
        const stages = new Map<number, BaseQuestStage>();
        if (json.stages) {
            Object.entries(json.stages).forEach(([key, val]) => {
                stages.set(parseInt(key), val);
            });
        }
        
        return {
            id: json.id,
            clientId: json.clientId,
            stages
        };
    }
}
