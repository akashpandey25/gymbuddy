/**
 * engine/muscle/shoulders.js
 * Shoulders exercise database + pattern-aware workout generator.
 * Patterns: overhead_press | lateral | rear_delt
 * Priority:  overhead_press → lateral → rear_delt
 * Rule: overhead_press is MANDATORY if equipment available.
 */

const { selectByPattern } = require("../patternSelector");

const MUSCLE = "shoulders";

const PATTERN_PRIORITY = [
  "overhead_press",
  "lateral",
  "rear_delt"
];

const shoulderExercises = [
  // ── Overhead Press (mandatory) ───────────────────────────────
  {
    name: "Barbell Overhead Press",
    muscle: MUSCLE, pattern: "overhead_press",
    equipment: ["barbell"],
    type: "compound",
    defaultSets: 4, defaultReps: "6-10"
  },
  {
    name: "Dumbbell Shoulder Press",
    muscle: MUSCLE, pattern: "overhead_press",
    equipment: ["dumbbell"],
    type: "compound",
    defaultSets: 4, defaultReps: "8-12"
  },
  {
    name: "Arnold Press",
    muscle: MUSCLE, pattern: "overhead_press",
    equipment: ["dumbbell"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12"
  },
  {
    name: "Machine Shoulder Press",
    muscle: MUSCLE, pattern: "overhead_press",
    equipment: ["machine"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12"
  },
  {
    name: "Pike Push-Ups",
    muscle: MUSCLE, pattern: "overhead_press",
    equipment: ["bodyweight"],
    type: "compound",
    defaultSets: 3, defaultReps: "12-15"
  },

  // ── Lateral ──────────────────────────────────────────────────
  {
    name: "Lateral Raises",
    muscle: MUSCLE, pattern: "lateral",
    equipment: ["dumbbell"],
    type: "isolation",
    defaultSets: 4, defaultReps: "12-15"
  },
  {
    name: "Cable Lateral Raises",
    muscle: MUSCLE, pattern: "lateral",
    equipment: ["cable machine"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },
  {
    name: "Upright Row",
    muscle: MUSCLE, pattern: "lateral",
    equipment: ["barbell", "dumbbell", "cable machine"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12"
  },

  // ── Rear Delt ────────────────────────────────────────────────
  {
    name: "Face Pulls",
    muscle: MUSCLE, pattern: "rear_delt",
    equipment: ["cable machine"],
    type: "isolation",
    defaultSets: 3, defaultReps: "15-20"
  },
  {
    name: "Dumbbell Rear Delt Flyes",
    muscle: MUSCLE, pattern: "rear_delt",
    equipment: ["dumbbell"],
    type: "isolation",
    defaultSets: 3, defaultReps: "15-20"
  },
  {
    name: "Reverse Pec Deck",
    muscle: MUSCLE, pattern: "rear_delt",
    equipment: ["pec deck"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  }
];

/**
 * Get a pattern-priority filtered shoulder workout.
 * overhead_press is always attempted first (mandatory if equipment permits).
 * @param {number}   time
 * @param {string[]} equipment
 * @param {Object}   [volumeState]
 * @param {string[]} [usedPatterns]
 * @returns {Object[]}
 */
function getShoulderWorkout(time, equipment, volumeState = {}, usedPatterns = []) {
  return selectByPattern({
    exercises: shoulderExercises,
    patternPriority: PATTERN_PRIORITY,
    muscle: MUSCLE,
    time,
    equipment,
    volumeState,
    usedPatterns
  });
}

module.exports = { getShoulderWorkout, shoulderExercises, MUSCLE };
