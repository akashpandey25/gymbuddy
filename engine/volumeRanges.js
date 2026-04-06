/**
 * volumeRanges.js
 * Ideal weekly set ranges per muscle × pattern.
 * Used by patternSelector to enforce volume guard.
 * Format: { muscle: { pattern: [min, max] } }
 */

const VOLUME_RANGES = {
    chest: {
        global_press: [8, 14],
        incline_press: [4, 10],
        fly: [6, 12]
    },
    back: {
        vertical_pull: [8, 14],
        horizontal_pull: [8, 14],
        hinge: [4, 8],
        upper_back: [6, 12]
    },
    legs: {
        knee_dominant: [8, 14],
        hip_dominant: [6, 12],
        isolation: [4, 10],
        calves: [6, 15]
    },
    shoulders: {
        overhead_press: [6, 12],
        lateral: [8, 16],
        rear_delt: [6, 14]
    },
    biceps: {
        primary_curl: [6, 12],
        brachialis: [6, 12],
        peak: [6, 12]
    },
    triceps: {
        pushdown: [6, 12],
        overhead_extension: [6, 12],
        press_extension: [6, 12]
    }
};

/**
 * Get the [min, max] range for a muscle/pattern.
 * Returns [0, Infinity] if not found (no cap).
 */
function getRange(muscle, pattern) {
    const m = (muscle || "").toLowerCase();
    const p = (pattern || "").toLowerCase();
    return (VOLUME_RANGES[m] && VOLUME_RANGES[m][p]) || [0, Infinity];
}

/**
 * How many sets are already logged this week for muscle/pattern?
 * volumeState shape: { muscle: { pattern: sets } }
 */
function getCurrentSets(volumeState, muscle, pattern) {
    if (!volumeState) return 0;
    const m = (muscle || "").toLowerCase();
    const p = (pattern || "").toLowerCase();
    return (volumeState[m] && volumeState[m][p]) || 0;
}

/**
 * Given desired sets to add, return the allowed sets after applying volume guard.
 * Hard cap: cannot exceed upperBound × 1.2
 * Soft cap: reduce to fill to upperBound exactly if it would exceed upperBound
 * Returns 0 if hard cap already crossed.
 */
function guardedSets(muscle, pattern, desiredSets, volumeState) {
    const [, upper] = getRange(muscle, pattern);
    const current = getCurrentSets(volumeState, muscle, pattern);
    const hardCap = Math.ceil(upper * 1.2);

    if (current >= hardCap) return 0;                    // already at hard cap → skip
    if (current + desiredSets > hardCap) return 0;       // adding any would blow hard cap → skip

    if (current + desiredSets > upper) {
        return Math.max(0, upper - current);               // trim to fill exactly to upper
    }
    return desiredSets;                                  // all sets allowed
}

/**
 * Returns true if a pattern is "near cap" (already at ≥ 80% of upper bound).
 * Near-cap patterns get deprioritized in favour of other patterns.
 */
function isNearCap(muscle, pattern, volumeState) {
    const [, upper] = getRange(muscle, pattern);
    if (!isFinite(upper)) return false;
    const current = getCurrentSets(volumeState, muscle, pattern);
    return current >= upper * 0.8;
}

module.exports = { VOLUME_RANGES, getRange, getCurrentSets, guardedSets, isNearCap };
