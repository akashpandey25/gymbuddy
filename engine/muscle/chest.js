/**
 * engine/muscle/chest.js
 * Chest exercise database + pattern-aware workout generator.
 * Patterns: global_press | fly | incline_press
 * Priority:  global_press → fly → incline_press
 * Rule: ≤50 min → max 1 press pattern (global_press OR incline_press, never both)
 */

const { selectByPattern } = require("../patternSelector");

const MUSCLE = "chest";

const PATTERN_PRIORITY = [
  "global_press",
  "fly",
  "incline_press"
];

// Patterns considered "press" — subject to the ≤50 min single-press rule
const PRESS_PATTERNS = ["global_press", "incline_press"];

const chestExercises = [
  // ── Global Press ────────────────────────────────────────────
  {
    name: "Barbell Bench Press",
    muscle: MUSCLE, pattern: "global_press",
    equipment: ["barbell", "bench"],
    type: "compound",
    defaultSets: 4, defaultReps: "6-10"
  },
  {
    name: "Dumbbell Bench Press",
    muscle: MUSCLE, pattern: "global_press",
    equipment: ["dumbbell", "bench"],
    type: "compound",
    defaultSets: 4, defaultReps: "8-12"
  },
  {
    name: "Smith Machine Press",
    muscle: MUSCLE, pattern: "global_press",
    equipment: ["smith machine"],
    type: "compound",
    defaultSets: 4, defaultReps: "8-12"
  },
  {
    name: "Push-Ups",
    muscle: MUSCLE, pattern: "global_press",
    equipment: ["bodyweight"],
    type: "compound",
    defaultSets: 4, defaultReps: "15-20"
  },

  // ── Fly ─────────────────────────────────────────────────────
  {
    name: "Dumbbell Flyes",
    muscle: MUSCLE, pattern: "fly",
    equipment: ["dumbbell", "bench"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },
  {
    name: "Cable Crossover",
    muscle: MUSCLE, pattern: "fly",
    equipment: ["cable machine"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },
  {
    name: "Pec Deck",
    muscle: MUSCLE, pattern: "fly",
    equipment: ["pec deck"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },

  // ── Incline Press ────────────────────────────────────────────
  {
    name: "Incline Barbell Press",
    muscle: MUSCLE, pattern: "incline_press",
    equipment: ["barbell", "bench"],
    type: "compound",
    defaultSets: 4, defaultReps: "8-10"
  },
  {
    name: "Incline Dumbbell Press",
    muscle: MUSCLE, pattern: "incline_press",
    equipment: ["dumbbell", "bench"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12"
  }
];

/**
 * Get a pattern-priority filtered chest workout.
 * @param {number}   time
 * @param {string[]} equipment
 * @param {Object}   [volumeState]
 * @param {string[]} [usedPatterns]
 * @returns {Object[]}
 */
function getChestWorkout(time, equipment, volumeState = {}, usedPatterns = []) {
  return selectByPattern({
    exercises: chestExercises,
    patternPriority: PATTERN_PRIORITY,
    muscle: MUSCLE,
    time,
    equipment,
    volumeState,
    pressPatterns: PRESS_PATTERNS,
    usedPatterns
  });
}

module.exports = { getChestWorkout, chestExercises, MUSCLE };
