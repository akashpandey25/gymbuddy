/**
 * engine/muscle/back.js
 * Back exercise database + pattern-aware workout generator.
 * Patterns: vertical_pull | horizontal_pull | hinge | upper_back
 * Priority:  vertical_pull → horizontal_pull → upper_back → hinge
 * Deadlift (hinge) is ALWAYS placed last — extracted post-selection.
 */

const { selectByPattern } = require("../patternSelector");
const { guardedSets } = require("../volumeRanges");

const MUSCLE = "back";

// Hinge (deadlift) is NOT in normal priority — it's always force-appended last
const PATTERN_PRIORITY = [
  "vertical_pull",
  "horizontal_pull",
  "upper_back"
];

const backExercises = [
  // ── Vertical Pull ───────────────────────────────────────────
  {
    name: "Pullups",
    muscle: MUSCLE, pattern: "vertical_pull",
    equipment: ["pullup bar", "bodyweight"],
    type: "compound",
    defaultSets: 4, defaultReps: "8-12"
  },
  {
    name: "Lat Pulldown Wide",
    muscle: MUSCLE, pattern: "vertical_pull",
    equipment: ["cable machine"],
    type: "compound",
    defaultSets: 4, defaultReps: "10-12"
  },
  {
    name: "Lat Pulldown Close Grip",
    muscle: MUSCLE, pattern: "vertical_pull",
    equipment: ["cable machine"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12"
  },
  {
    name: "Chin-Ups",
    muscle: MUSCLE, pattern: "vertical_pull",
    equipment: ["pullup bar", "bodyweight"],
    type: "compound",
    defaultSets: 3, defaultReps: "8-12"
  },

  // ── Horizontal Pull ─────────────────────────────────────────
  {
    name: "Barbell Row",
    muscle: MUSCLE, pattern: "horizontal_pull",
    equipment: ["barbell"],
    type: "compound",
    defaultSets: 4, defaultReps: "8-10"
  },
  {
    name: "Dumbbell Row",
    muscle: MUSCLE, pattern: "horizontal_pull",
    equipment: ["dumbbell"],
    type: "compound",
    defaultSets: 4, defaultReps: "10-12"
  },
  {
    name: "Cable Row",
    muscle: MUSCLE, pattern: "horizontal_pull",
    equipment: ["cable machine"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12"
  },
  {
    name: "Machine Row",
    muscle: MUSCLE, pattern: "horizontal_pull",
    equipment: ["machine"],
    type: "compound",
    defaultSets: 3, defaultReps: "10-12"
  },

  // ── Upper Back ──────────────────────────────────────────────
  {
    name: "Face Pulls",
    muscle: MUSCLE, pattern: "upper_back",
    equipment: ["cable machine"],
    type: "isolation",
    defaultSets: 3, defaultReps: "15-20"
  },
  {
    name: "Hyperextensions",
    muscle: MUSCLE, pattern: "upper_back",
    equipment: ["hyperextension bench", "bodyweight"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },
  {
    name: "Dumbbell Pullover",
    muscle: MUSCLE, pattern: "upper_back",
    equipment: ["dumbbell", "bench"],
    type: "isolation",
    defaultSets: 3, defaultReps: "12-15"
  },

  // ── Hinge (always last) ─────────────────────────────────────
  {
    name: "Deadlift",
    muscle: MUSCLE, pattern: "hinge",
    equipment: ["barbell"],
    type: "compound",
    defaultSets: 3, defaultReps: "8→5→3",
    isDeadlift: true
  },
  {
    name: "Romanian Deadlift",
    muscle: MUSCLE, pattern: "hinge",
    equipment: ["barbell", "dumbbell"],
    type: "compound",
    defaultSets: 3, defaultReps: "8-10"
  }
];

/**
 * Get a pattern-priority filtered back workout.
 * Deadlift (hinge) is ALWAYS appended last when barbell is available and time > 20.
 * @param {number}   time
 * @param {string[]} equipment
 * @param {Object}   [volumeState]
 * @param {string[]} [usedPatterns]
 * @returns {Object[]} ordered plan items
 */
function getBackWorkout(time, equipment, volumeState = {}, usedPatterns = []) {
  const avail = equipment.map(e => e.toLowerCase());

  // Select main exercises (vertical, horizontal, upper_back) via pattern selector
  const plan = selectByPattern({
    exercises: backExercises.filter(e => e.pattern !== "hinge"),
    patternPriority: PATTERN_PRIORITY,
    muscle: MUSCLE,
    time,
    equipment,
    volumeState,
    usedPatterns
  });

  // Deadlift: always append last if barbell available and time > 20 min
  if (time > 20 && avail.includes("barbell")) {
    const deadlift = backExercises.find(e => e.isDeadlift);
    if (deadlift) {
      const { guardedSets } = require("../volumeRanges");
      const allowedSets = guardedSets(MUSCLE, "hinge", deadlift.defaultSets, volumeState);
      if (allowedSets > 0) {
        plan.push({
          exercise: deadlift.name,
          muscle: MUSCLE,
          pattern: "hinge",
          sets: allowedSets,
          reps: deadlift.defaultReps,
          type: deadlift.type,
          equipment: deadlift.equipment[0]
        });
      }
    }
  }

  return plan;
}

module.exports = { getBackWorkout, backExercises, MUSCLE };
