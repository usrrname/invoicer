/**
 * Internal billing rates (CAD/hour). Edit here to match your contracts.
 *
 * Preferred approach: set per-line `Rate` in the markdown line-items table.
 * Fallback approach: use DEFAULT_HOURLY_RATE when a row omits `Rate`.
 */

/** @type {number} */
export const DEFAULT_HOURLY_RATE = 120;

/**
 * @typedef {{ pattern: RegExp, rate: number }} HourlyRateRule
 */

/** @type {HourlyRateRule[]} */
export const HOURLY_RATE_RULES = [];

/**
 * @param {string} description
 * @returns {string}
 */
function normalizeDescription(description) {
  return String(description ?? '').replace(/\*\*/g, '').trim();
}

/**
 * @param {string} description
 * @returns {number}
 */
export function hourlyRateForDescription(description) {
  const d = normalizeDescription(description);
  for (const rule of HOURLY_RATE_RULES) {
    if (rule.pattern.test(d)) return rule.rate;
  }
  return DEFAULT_HOURLY_RATE;
}
