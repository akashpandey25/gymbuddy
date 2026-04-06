/**
 * engine/muscle/biceps.js
 * Biceps exercise database + pattern-aware workout generator.
 * Patterns: primary_curl | brachialis | peak
 * Priority:  primary_curl → brachialis → peak
 */

const { selectByPattern } = require("../patternSelector");

const MUSCLE = "biceps";

const PATTERN_PRIORITY = [
  "primary_curl",
  "brachialis",
  "peak"
];

const bicepsExercises = [
  // ── Primary Curl ─────────────────────────────────────────────
  {
    name: "Barbell Curl",
    muscle: MUSCLE, pattern: "primary_curl",
    equipment: ["barbell"],
    type: "compound",
    defaultSets: 4, defaultReps: "8-12"
  },
  {
    name: "Dumbbell Curl",
    muscle: MUSCLE, pattern: "primary_curl",
    equipment: ["dumbbell"],
    type: "isolation",
    defaultSets: 3, defaultReps: "10-12"
  },
  {
    name: "Cable Curl",
    muscle: MUSCLE, pattern: "primary_curl",
    equipment: ["cable machine"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },
  {
    name: "Chin-Ups",
    muscle: MUSCLE, pattern: "primary_curl",
    equipment: ["pullup bar", "bodyweight"],
    type: "compound",
    defaultSets: 3, defaultReps: "8-12"
  },

  // ── Brachialis ───────────────────────────────────────────────
  {
    name: "Hammer Curl",
    muscle: MUSCLE, pattern: "brachialis",
    equipment: ["dumbbell"],
    type: "isolation",
    defaultSets: 3, defaultReps: "10-12"
  },
  {
    name: "Reverse Curl",
    muscle: MUSCLE, pattern: "brachialis",
    equipment: ["barbell", "dumbbell", "cable machine"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },

  // ── Peak ─────────────────────────────────────────────────────
  {
    name: "Concentration Curl",
    muscle: MUSCLE, pattern: "peak",
    equipment: ["dumbbell"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },
  {
    name: "Preacher Curl",
    muscle: MUSCLE, pattern: "peak",
    equipment: ["barbell", "dumbbell"],
    type: "isolation",
    defaultSets: 3, defaultReps: "10-12"
  },
  {
    name: "Incline Dumbbell Curl",
    muscle: MUSCLE, pattern: "peak",
    equipment: ["dumbbell", "bench"],
    type: "isolation",
    defaultSets: 3, defaultReps: "10-12"
  }
];

/**
 * Get a pattern-priority filtered biceps workout.
 * @param {number}   time
 * @param {string[]} equipment
 * @param {Object}   [volumeState]
 * @param {string[]} [usedPatterns]
 * @returns {Object[]}
 */
function getBicepsWorkout(time, equipment, volumeState = {}, usedPatterns = []) {
  return selectByPattern({
    exercises: bicepsExercises,
    patternPriority: PATTERN_PRIORITY,
    muscle: MUSCLE,
    time,
    equipment,
    volumeState,
    usedPatterns
  });
}

module.exports = { getBicepsWorkout, bicepsExercises, MUSCLE };
