/* eslint-disable @typescript-eslint/naming-convention */
import type { CollectionSpec } from '../../Database/Interfaces/ICollectionManager';

const defaultScope = '_default';

export const collectionSettings: Record<string, CollectionSpec[]> = {
	MythWarServer: [
		{
			name: 'Action',
			scopeName: defaultScope,
			primaryIndex: true,
		},
		{
			name: 'BaseItem',
			scopeName: defaultScope,
			primaryIndex: true,
		},
		{
			name: 'Condition',
			scopeName: defaultScope,
			primaryIndex: true,
		},
		{
			name: 'GameData',
			scopeName: defaultScope,
		},
		{
			name: 'Npc',
			scopeName: defaultScope,
			primaryIndex: true,
		},
		{
			name: 'User',
			scopeName: defaultScope,
			primaryIndex: true,
		},
		{
			name: 'Player',
			scopeName: defaultScope,
			primaryIndex: true,
		},
	],
};
