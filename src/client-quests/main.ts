import { readFileSync, writeFileSync } from 'fs';
import { readClientQuests } from './quests';

let client = 'client/main.exe';
let dest = 'output/quests.json';

let buffer = readFileSync(client);
let quests = readClientQuests(buffer);
writeFileSync(dest, JSON.stringify(quests, null, '\t'));
