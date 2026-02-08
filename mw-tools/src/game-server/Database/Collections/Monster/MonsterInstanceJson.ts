import type { Direction } from '../../../Enums/Direction';
import type { PointJson } from '../../../Utils/Point';

export type MonsterInstanceJson = {
	id: number;
	templateId: string;
	map: number;
	point: PointJson;
	direction: Direction;
	respawnTime?: number;
};
