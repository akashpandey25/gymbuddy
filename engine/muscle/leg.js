/**
 * engine/muscle/leg.js
 * Legs exercise database + pattern-aware workout generator.
 * Patterns: knee_dominant | hip_dominant | isolation | calves
 * Priority:  knee_dominant → hip_dominant → isolation → calves
 */

const { selectByPattern } = require("../patternSelector");

const MUSCLE = "legs";

const PATTERN_PRIORITY = [
  "knee_dominant",
  "hip_dominant",
  "isolation",
  "calves"
];

const legExercises = [
  // ── Knee Dominant ────────────────────────────────────────────
  {
    name: "Barbell Squat",
    muscle: MUSCLE, pattern: "knee_dominant",
    equipment: ["barbell"],
    type: "compound",
    defaultSets: 4, defaultReps: "6-10"
  },
  {
    name: "Leg Press",
    muscle: MUSCLE, pattern: "knee_dominant",
    equipment: ["leg press"],
    type: "compound",
    defaultSets: 4, defaultReps: "10-12"
  },
  {
    name: "Dumbbell Lunges",
    muscle: MUSCLE, pattern: "knee_dominant",
    equipment: ["dumbbell"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12 each leg"
  },
  {
    name: "Goblet Squat",
    muscle: MUSCLE, pattern: "knee_dominant",
    equipment: ["dumbbell", "kettlebell"],
    type: "compound",
    defaultSets: 3, defaultReps: "12-15"
  },
  {
    name: "Bulgarian Split Squat",
    muscle: MUSCLE, pattern: "knee_dominant",
    equipment: ["dumbbell", "bodyweight"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12 each leg"
  },
  {
    name: "Bodyweight Squat",
    muscle: MUSCLE, pattern: "knee_dominant",
    equipment: ["bodyweight"],
    type: "compound",
    defaultSets: 4, defaultReps: "20-25"
  },

  // ── Hip Dominant ─────────────────────────────────────────────
  {
    name: "Romanian Deadlift",
    muscle: MUSCLE, pattern: "hip_dominant",
    equipment: ["barbell"],
    type: "compound",
    defaultSets: 4, defaultReps: "8-10"
  },
  {
    name: "Dumbbell Romanian Deadlift",
    muscle: MUSCLE, pattern: "hip_dominant",
    equipment: ["dumbbell"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12"
  },
  {
    name: "Hip Thrust",
    muscle: MUSCLE, pattern: "hip_dominant",
    equipment: ["barbell", "bench"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-15"
  },
  {
    name: "Glute Bridge",
    muscle: MUSCLE, pattern: "hip_dominant",
    equipment: ["bodyweight"],
    type: "compound",
    defaultSets: 3, defaultReps: "15-20"
  },

  // ── Isolation ────────────────────────────────────────────────
  {
    name: "Leg Extension",
    muscle: MUSCLE, pattern: "isolation",
    equipment: ["leg extension"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },
  {
    name: "Leg Curl",
    muscle: MUSCLE, pattern: "isolation",
    equipment: ["leg curl"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },

  // ── Calves ───────────────────────────────────────────────────
  {
    name: "Calf Raises",
    muscle: MUSCLE, pattern: "calves",
    equipment: ["bodyweight", "dumbbell", "barbell"],
    type: "isolation",
    defaultSets: 4, defaultReps: "15-20"
  },
  {
    name: "Seated Calf Raises",
    muscle: MUSCLE, pattern: "calves",
    equipment: ["machine", "dumbbell"],
    type: "isolation",
    defaultSets: 3, defaultReps: "15-20"
  }
];

/**
 * Get a pattern-priority filtered leg workout.
 * @param {number}   time
 * @param {string[]} equipment
 * @param {Object}   [volumeState]
 * @param {string[]} [usedPatterns]
 * @returns {Object[]}
 */
function getLegWorkout(time, equipment, volumeState = {}, usedPatterns = []) {
  return selectByPattern({
    exercises: legExercises,
    patternPriority: PATTERN_PRIORITY,
    muscle: MUSCLE,
    time,
    equipment,
    volumeState,
    usedPatterns
  });
}

module.exports = { getLegWorkout, legExercises, MUSCLE };
