/**
 * engine/swapEngine.js
 * Pattern-aware substitute finder.
 *
 * Lookup chain:
 *  1. Same pattern + same muscle → prefer compound
 *  2. Same muscle, any pattern (not already in usedPatterns)
 *  3. Any muscle, same pattern (broad fallback)
 *  4. Bodyweight option for same muscle
 *
 * Input:  { exercise: string, equipment: string[], usedPatterns?: string[] }
 * Output: { alternative, muscle, pattern, sets, reps, equipment, reason } | null
 */

const { backExercises } = require("./muscle/back");
const { chestExercises } = require("./muscle/chest");
const { legExercises } = require("./muscle/leg");
const { shoulderExercises } = require("./muscle/shoulders");
const { bicepsExercises } = require("./muscle/biceps");
const { tricepsExercises } = require("./muscle/triceps");

const ALL_EXERCISES = [
    ...backExercises,
    ...chestExercises,
    ...legExercises,
    ...shoulderExercises,
    ...bicepsExercises,
    ...tricepsExercises
];

/**
 * Find the best swap for a given exercise.
 * @param {string}   exerciseName    - Name of exercise to replace
 * @param {string[]} equipment       - Available equipment
 * @param {string[]} [usedPatterns]  - Patterns already in current plan
 * @returns {Object|null}
 */
function findSwap(exerciseName, equipment, usedPatterns = []) {
    const avail = equipment.map(e => e.toLowerCase());
    const usedSet = new Set(usedPatterns.map(p => p.toLowerCase()));

    const original = ALL_EXERCISES.find(
        ex => ex.name.toLowerCase() === exerciseName.toLowerCase()
    );

    if (!original) {
        return { alternative: null, message: "Exercise not found in database" };
    }

    const { pattern: targetPattern, muscle: targetMuscle } = original;

    // Helper filters
    const canUse = ex => ex.equipment.some(eq => avail.includes(eq.toLowerCase()));
    const notSelf = ex => ex.name.toLowerCase() !== exerciseName.toLowerCase();
    const preferC = (a, b) => (a.type === "compound" ? -1 : 1);

    // ── 1. Same pattern + same muscle ────────────────────────────
    const tier1 = ALL_EXERCISES
        .filter(ex => notSelf(ex) && canUse(ex) && ex.pattern === targetPattern && ex.muscle === targetMuscle)
        .sort(preferC);

    if (tier1.length > 0) {
        return buildResult(tier1[0], "Same pattern, same muscle");
    }

    // ── 2. Same muscle, different pattern (avoid usedPatterns) ───
    const tier2 = ALL_EXERCISES
        .filter(ex =>
            notSelf(ex) &&
            canUse(ex) &&
            ex.muscle === targetMuscle &&
            !usedSet.has(ex.pattern)
        )
        .sort(preferC);

    if (tier2.length > 0) {
        return buildResult(tier2[0], "Same muscle, alternate pattern");
    }

    // ── 3. Same pattern, any muscle ──────────────────────────────
    const tier3 = ALL_EXERCISES
        .filter(ex => notSelf(ex) && canUse(ex) && ex.pattern === targetPattern)
        .sort(preferC);

    if (tier3.length > 0) {
        return buildResult(tier3[0], "Same pattern, different muscle");
    }

    // ── 4. Bodyweight fallback for same muscle ────────────────────
    const tier4 = ALL_EXERCISES
        .filter(ex =>
            notSelf(ex) &&
            ex.muscle === targetMuscle &&
            ex.equipment.some(eq => eq.toLowerCase() === "bodyweight")
        )
        .sort(preferC);

    if (tier4.length > 0) {
        return buildResult(tier4[0], "Bodyweight fallback, same muscle");
    }

    return { alternative: null, message: "No suitable swap found for available equipment" };
}

function buildResult(ex, reason) {
    return {
        alternative: ex.name,
        muscle: ex.muscle,
        pattern: ex.pattern,
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        equipment: ex.equipment[0],
        reason
    };
}

module.exports = { findSwap };
