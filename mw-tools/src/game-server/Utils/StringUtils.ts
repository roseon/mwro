import { FightStatJson } from '../GameState/Fight/FightStats';

/**
 * Returns the string up to the first zero byte.
 * @param str
 */
export function endAtZero(str: string): string {
	let index = str.indexOf('\0');
	return index === -1 ? str : str.substring(0, index);
}

/**
 * Check if a string is a valid name.
 * Allows letters, numbers, `-` and `_`.
 * @param str
 */
export function isValidName(str: string): boolean {
	let regex = /^[a-zA-Z0-9\-_]{1,14}$/;
	return regex.test(str);
}

/**
 * Sanitizes a chat message to prevent exploits and crashes.
 * - Removes control characters
 * - Limits message length (to prevent bypass)
 * - Allows Unicode characters while preventing potentially dangerous ones
 * @param str The message to sanitize
 * @param maxLength Maximum allowed length (default: 180)
 */
export function sanitizeChatMessage(str: string, maxLength: number = 180): string {
	// Remove control characters (0x00-0x1F, 0x7F) and other potentially dangerous characters
	// But preserve spaces, tabs, and newlines
	let sanitized = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

	// Remove zero-width characters and other invisible Unicode characters
	sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

	// Remove only the most problematic combining marks that could be used for exploits
	// while preserving normal accented characters
	sanitized = sanitized.replace(/[\u20D0-\u20FF]/g, ''); // Combining diacritical marks for symbols

	// Trim whitespace
	sanitized = sanitized.trim();

	// Limit length
	if (sanitized.length > maxLength) {
		sanitized = sanitized.substring(0, maxLength);
	}

	return sanitized;
}

/**
 * Convert a camelCase key into “Title Case” with spaces.
 * e.g. "berserkRate" → "Berserk Rate", "iceResist" → "Ice Resist"
 */
function camelToTitle(key: string): string {
	// 1) insert a space before every uppercase letter
	// 2) uppercase the very first character
	return key
		.replace(/([A-Z])/g, ' $1') // "berserkRate" → "berserk Rate"
		.replace(/^./, str => str.toUpperCase()); // "berserk Rate" → "Berserk Rate"
}

/**
 * Given a partial FightStatJson (any subset of its keys),
 * return an array of strings like "5 Berserk Rate", "100 Hp", etc.
 *
 * Example:
 *   formatFightStatJson({ berserkRate: 5, hp: 100 })
 *   // → [ "5 Berserk Rate", "100 Hp" ]
 */
export function formatFightStatJson(stats: FightStatJson): string[] {
	return Object.entries(stats)
		.filter(([, val]) => val !== undefined && val !== null) // only keep defined fields
		.map(([key, val]) => {
			const title = camelToTitle(key);
			// Cast val to number because TypeScript sees it as number | undefined
			return `${val as number} ${title}`;
		});
}
