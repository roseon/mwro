import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

export type ClientQuest = {
	idStart: number;
	idEnd: number;
	name: string;
	level: number;
	description: string;
};

const QUEST_SIZE = 376;

function isValidString(buffer: Buffer, start: number, maxLength: number): boolean {
    let len = 0;
    for(let i=0; i<maxLength; i++) {
        const byte = buffer[start+i];
        if (byte === 0) break;
        // Allow high-bit characters for potential localized text (e.g. Chinese)
        if (byte < 32 && byte !== 13 && byte !== 10) return false; // Printable + CR/LF
        len++;
    }
    return len > 0;
}

function parseQuest(buffer: Buffer, offset: number): ClientQuest | null {
    if (offset + QUEST_SIZE > buffer.length) return null;

    const idStart = buffer.readUInt32LE(offset);
    const idEnd = buffer.readUInt32LE(offset + 4);

    // Heuristics to identify quest structure
    if (idStart === 0 && idEnd === 0) {
        // Special case: 0/0 is common for "Custom Quest" or placeholder
    } else if (idStart !== idEnd) {
         // Quests usually have matching Start/End IDs or End=Start+1?
         // In existing data: 10000, 10000.
         // Let's filter out mismatches if they are garbage.
         // But what if a quest spans multiple IDs?
         // Let's check name validity first.
         if (Math.abs(idStart - idEnd) > 1000) return null; // unlikely ID range
    }

    // Name check
    if (!isValidString(buffer, offset + 8, 8)) return null; // At least check first 8 bytes of name

    let name = buffer.toString('binary', offset + 8, offset + 72);
    const nullIdx = name.indexOf('\x00');
    if (nullIdx >= 0) name = name.substring(0, nullIdx);
    
    // Description check
    if (!isValidString(buffer, offset + 73, 16)) return null; // Check start of desc

    let description = buffer.toString('binary', offset + 73, offset + 376);
    const descNullIdx = description.indexOf('\x00');
    if (descNullIdx >= 0) description = description.substring(0, descNullIdx);

    const level = buffer.readUInt8(offset + 72);
    
    // Additional filtering: Name shouldn't be garbage
    if (name.length < 2) return null;

    return { idStart, idEnd, name, level, description };
}

function scanFile(filePath: string, quests: Map<number | string, ClientQuest>) {
    console.log(`Scanning ${filePath}...`);
    try {
        const buffer = readFileSync(filePath);
        // Scan with 4-byte alignment
        for (let i = 0; i < buffer.length - QUEST_SIZE; i += 4) {
            const q = parseQuest(buffer, i);
            if (q) {
                if (q.idStart === 0) {
                     // Dedup by name for ID 0
                    let found = false;
                    for(const eq of quests.values()) {
                        if (eq.idStart === 0 && eq.name === q.name) {
                            found = true; 
                            break;
                        }
                    }
                    if (!found) quests.set(-1 * i, q); 
                 } else {
                    // Prefer keeping existing or overwriting?
                    // Let's overwrite as later files might be newer (or vice versa).
                    // Or keep the one with longer description?
                    if (!quests.has(q.idStart)) {
                        quests.set(q.idStart, q);
                    } else {
                         const existing = quests.get(q.idStart)!;
                         if (existing.description.length < q.description.length) {
                             quests.set(q.idStart, q);
                         }
                    }
                 }
            }
        }
    } catch (e) {
        console.error(`Skipping ${filePath}: ${e.message}`); // Use e.message
    }
}

const clientDir = 'client';
const outputDir = 'output';
const quests = new Map<number | string, ClientQuest>();

// Scan known executables
scanFile(join(clientDir, 'main.exe'), quests);
if (existsSync(join(clientDir, 'GameClient.exe'))) scanFile(join(clientDir, 'GameClient.exe'), quests);
if (existsSync(join(clientDir, 'myth player.exe'))) scanFile(join(clientDir, 'myth player.exe'), quests);

// Scan extra folder if exists
const extraDir = join(clientDir, 'extra');

if (existsSync(extraDir) && statSync(extraDir).isDirectory()) {
    const files = readdirSync(extraDir);
    for (const file of files) {
        scanFile(join(extraDir, file), quests);
    }
}

const sortedQuests = Array.from(quests.values()).sort((a,b) => {
    if (a.idStart !== b.idStart) return a.idStart - b.idStart;
    return 0;
});

const json = JSON.stringify(sortedQuests, null, '\t');
writeFileSync(join(outputDir, 'quests_all.json'), json);
console.log(`Extracted ${quests.size} quests to ${join(outputDir, 'quests_all.json')}.`);
