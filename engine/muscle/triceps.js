/**
 * engine/muscle/triceps.js
 * Triceps exercise database + pattern-aware workout generator.
 * Patterns: pushdown | overhead_extension | press_extension
 * Priority:  pushdown → overhead_extension → press_extension
 */

const { selectByPattern } = require("../patternSelector");

const MUSCLE = "triceps";

const PATTERN_PRIORITY = [
  "pushdown",
  "overhead_extension",
  "press_extension"
];

const tricepsExercises = [
  // ── Pushdown ─────────────────────────────────────────────────
  {
    name: "Tricep Pushdown",
    muscle: MUSCLE, pattern: "pushdown",
    equipment: ["cable machine"],
    type: "isolation",
    defaultSets: 4, defaultReps: "10-12"
  },
  {
    name: "Rope Pushdown",
    muscle: MUSCLE, pattern: "pushdown",
    equipment: ["cable machine"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },
  {
    name: "Dumbbell Kickbacks",
    muscle: MUSCLE, pattern: "pushdown",
    equipment: ["dumbbell"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },

  // ── Overhead Extension ───────────────────────────────────────
  {
    name: "Overhead Tricep Extension",
    muscle: MUSCLE, pattern: "overhead_extension",
    equipment: ["dumbbell", "cable machine"],
    type: "isolation",
    defaultSets: 3, defaultReps: "10-12"
  },
  {
    name: "Skull Crushers",
    muscle: MUSCLE, pattern: "overhead_extension",
    equipment: ["barbell", "dumbbell"],
    type: "isolation",
    defaultSets: 3, defaultReps: "10-12"
  },

  // ── Press Extension ──────────────────────────────────────────
  {
    name: "Close Grip Bench Press",
    muscle: MUSCLE, pattern: "press_extension",
    equipment: ["barbell", "bench"],
    type: "compound",
    defaultSets: 4, defaultReps: "8-10"
  },
  {
    name: "Tricep Dips",
    muscle: MUSCLE, pattern: "press_extension",
    equipment: ["bodyweight", "dip bar"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-15"
  },
  {
    name: "Diamond Push-Ups",
    muscle: MUSCLE, pattern: "press_extension",
    equipment: ["bodyweight"],
    type: "compound",
    defaultSets: 3, defaultReps: "12-15"
  }
];

/**
 * Get a pattern-priority filtered triceps workout.
 * @param {number}   time
 * @param {string[]} equipment
 * @param {Object}   [volumeState]
 * @param {string[]} [usedPatterns]
 * @returns {Object[]}
 */
function getTricepsWorkout(time, equipment, volumeState = {}, usedPatterns = []) {
  return selectByPattern({
    exercises: tricepsExercises,
    patternPriority: PATTERN_PRIORITY,
    muscle: MUSCLE,
    time,
    equipment,
    volumeState,
    usedPatterns
  });
}

module.exports = { getTricepsWorkout, tricepsExercises, MUSCLE };
