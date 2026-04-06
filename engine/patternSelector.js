/**
 * patternSelector.js
 * Core pattern-priority + time-bucket + volume-guard selection algorithm.
 * Pure function — no DB, no Express.
 *
 * @param {Object[]} exercises        - Full exercise array for one muscle
 * @param {string[]} patternPriority  - Ordered list of patterns to try
 * @param {string}   muscle           - Muscle name (for volume lookups)
 * @param {number}   time             - Available minutes
 * @param {string[]} equipment        - Available equipment (lowercase)
 * @param {Object}   volumeState      - { muscle: { pattern: currentSets } }
 * @param {Object}   options          - { allowDuplicatePatterns, maxExercises, pressPatterns }
 */

const { guardedSets, isNearCap } = require("./volumeRanges");

// ── Time bucket → max exercises ────────────────────────────────────────────────
function timeBucket(time) {
    if (time >= 60) return { max: 6, allowDuplicate: true };
    if (time >= 40) return { max: 4, allowDuplicate: false };
    if (time >= 25) return { max: 3, allowDuplicate: false };
    return { max: 1, allowDuplicate: false };
}

/**
 * Select exercises using pattern priority + time + volume guard.
 *
 * @param {Object}  opts
 * @param {Object[]} opts.exercises
 * @param {string[]} opts.patternPriority
 * @param {string}   opts.muscle
 * @param {number}   opts.time
 * @param {string[]} opts.equipment
 * @param {Object}   [opts.volumeState]
 * @param {string[]} [opts.pressPatterns]   - Patterns that count as "press" (chest rule)
 * @param {string[]} [opts.usedPatterns]    - Patterns already in plan (cross-muscle dedup)
 * @returns {Object[]} selected plan items
 */
function selectByPattern({
    exercises,
    patternPriority,
    muscle,
    time,
    equipment,
    volumeState = {},
    pressPatterns = [],
    usedPatterns = []
}) {
    const avail = equipment.map(e => e.toLowerCase());
    const { max, allowDuplicate } = timeBucket(time);

    // Filter by equipment
    const eligible = exercises.filter(ex =>
        ex.equipment.some(eq => avail.includes(eq.toLowerCase()))
    );

    const selected = [];
    const usedPatternsSet = new Set(usedPatterns.map(p => p.toLowerCase()));
    let pressCount = 0;

    // Iterate patterns in priority order
    for (const pattern of patternPriority) {
        if (selected.length >= max) break;

        // Skip if pattern already used (unless duplicates allowed)
        if (!allowDuplicate && usedPatternsSet.has(pattern)) continue;

        // Chest rule: ≤50 min → max 1 press-type pattern
        const isPress = pressPatterns.includes(pattern);
        if (isPress && pressCount >= 1 && time <= 50) continue;

        // Get candidates for this pattern (prefer compound over isolation)
        const candidates = eligible
            .filter(ex => ex.pattern === pattern)
            .sort((a, b) => {
                // compound first
                if (a.type === "compound" && b.type !== "compound") return -1;
                if (b.type === "compound" && a.type !== "compound") return 1;
                return 0;
            });

        if (candidates.length === 0) continue;

        // Near-cap → move this pattern to lower priority (skip this iteration, add to end)
        const best = candidates[0];
        const allowedSets = guardedSets(muscle, pattern, best.defaultSets, volumeState);

        if (allowedSets === 0) continue; // hard cap hit — skip pattern

        // Build plan item
        const item = {
            exercise: best.name,
            muscle: muscle,
            pattern: pattern,
            sets: allowedSets,
            reps: best.defaultReps,
            type: best.type,
            equipment: best.equipment[0]
        };

        selected.push(item);
        usedPatternsSet.add(pattern);
        if (isPress) pressCount++;
    }

    // Second pass: near-cap patterns not yet selected (if room remains)
    if (selected.length < max && allowDuplicate) {
        for (const pattern of patternPriority) {
            if (selected.length >= max) break;
            if (usedPatternsSet.has(pattern)) continue;

            const candidates = eligible
                .filter(ex => ex.pattern === pattern)
                .sort((a, b) => (a.type === "compound" ? -1 : 1));

            if (candidates.length === 0) continue;
            const best = candidates[0];
            const allowedSets = guardedSets(muscle, pattern, best.defaultSets, volumeState);
            if (allowedSets === 0) continue;

            selected.push({
                exercise: best.name,
                muscle,
                pattern,
                sets: allowedSets,
                reps: best.defaultReps,
                type: best.type,
                equipment: best.equipment[0]
            });
            usedPatternsSet.add(pattern);
        }
    }

    return selected;
}

module.exports = { selectByPattern, timeBucket };
