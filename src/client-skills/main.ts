import { readFileSync, writeFileSync } from 'fs';
import { readClientSkills } from './skills';

let client = 'client/main.exe';
let dest = 'output/skills.json';

let buffer = readFileSync(client);
let skills = readClientSkills(buffer);
writeFileSync(dest, JSON.stringify(skills, null, '\t'));
