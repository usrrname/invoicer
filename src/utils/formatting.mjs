/**
 * Escapes HTML characters in a string
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Formats a number as a currency amount
 * @param {number} value - The value to format
 * @returns {string} The formatted amount
 */
export function formatAmount(value) {
    const n = Number(value);
    return isNaN(n) ? '—' : '$' + n.toFixed(2);
}

/**
 * Rounds a number to 2 decimal places
 * @param {number} value - The value to round
 * @returns {number} The rounded value
 */
export function roundToTwoDecimals(value) {
    return Math.round(value * 100) / 100;
}

/**
 * Parses a numeric value from a string, removing currency symbols, commas, and whitespace
 * @param {string} str - The string to parse
 * @returns {number|null} The parsed number or null if not parseable
 */
export function parseNumericValue(str) {
    if (!str) return null;
    // Remove $, commas, and whitespace, then parse
    const cleaned = str.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
}