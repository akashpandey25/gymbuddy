/**
 * engine/combo.js
 * Combo workout generator — two muscle groups in one session.
 * Supported: back+biceps | chest+triceps | legs+shoulders
 *
 * Time split is PERCENTAGE-based:
 *   ≥60 min → 65% primary / 35% secondary
 *   40–50   → 70% primary / 30% secondary
 *   25–35   → 75% primary / 25% secondary
 *   <25     → 100% primary / 0% secondary
 *
 * After merge: duplicate patterns across both muscles are removed.
 * Deadlift (if present) is always last.
 */

const { getBackWorkout } = require("./muscle/back");
const { getBicepsWorkout } = require("./muscle/biceps");
const { getChestWorkout } = require("./muscle/chest");
const { getTricepsWorkout } = require("./muscle/triceps");
const { getLegWorkout } = require("./muscle/leg");
const { getShoulderWorkout } = require("./muscle/shoulders");

const COMBOS = {
  "back+biceps": { primary: "back", secondary: "biceps" },
  "biceps+back": { primary: "back", secondary: "biceps" },
  "chest+triceps": { primary: "chest", secondary: "triceps" },
  "triceps+chest": { primary: "chest", secondary: "triceps" },
  "legs+shoulders": { primary: "legs", secondary: "shoulders" },
  "shoulders+legs": { primary: "legs", secondary: "shoulders" }
};

/**
 * Split total time into primary / secondary minutes by percentage.
 */
function splitTimeBudget(time) {
  if (time >= 60) return { primary: Math.round(time * 0.65), secondary: Math.round(time * 0.35) };
  if (time >= 40) return { primary: Math.round(time * 0.70), secondary: Math.round(time * 0.30) };
  if (time >= 25) return { primary: Math.round(time * 0.75), secondary: Math.round(time * 0.25) };
  return { primary: time, secondary: 0 };
}

function getByMuscle(muscle, time, equipment, volumeState, usedPatterns) {
  switch (muscle) {
    case "back": return getBackWorkout(time, equipment, volumeState, usedPatterns);
    case "biceps": return getBicepsWorkout(time, equipment, volumeState, usedPatterns);
    case "chest": return getChestWorkout(time, equipment, volumeState, usedPatterns);
    case "triceps": return getTricepsWorkout(time, equipment, volumeState, usedPatterns);
    case "legs": return getLegWorkout(time, equipment, volumeState, usedPatterns);
    case "shoulders": return getShoulderWorkout(time, equipment, volumeState, usedPatterns);
    default: return [];
  }
}

/**
 * Generate a combo day workout.
 * @param {string[]} targets     - e.g. ["back","biceps"]
 * @param {number}   time        - Total available minutes
 * @param {string[]} equipment   - Available equipment
 * @param {Object}   [volumeState]
 * @returns {Object[]} merged, ordered workout plan
 */
function getComboWorkout(targets, time, equipment, volumeState = {}) {
  const key = targets.map(t => t.toLowerCase()).join("+");
  const combo = COMBOS[key];

  if (!combo) {
    throw new Error(`Unsupported combo: ${key}. Supported: ${Object.keys(COMBOS).join(", ")}`);
  }

  const { primary: primaryMuscle, secondary: secondaryMuscle } = combo;
  const { primary: primaryTime, secondary: secondaryTime } = splitTimeBudget(time);

  // Build primary plan first
  const primaryPlan = getByMuscle(primaryMuscle, primaryTime, equipment, volumeState, []);

  // Collect patterns already used in primary plan (for dedup in secondary)
  const primaryPatterns = primaryPlan.map(e => e.pattern);

  // Build secondary plan, skipping any patterns already covered
  const secondaryPlan = secondaryTime > 0
    ? getByMuscle(secondaryMuscle, secondaryTime, equipment, volumeState, primaryPatterns)
    : [];

  // Merge: primary first, then secondary
  let merged = [...primaryPlan, ...secondaryPlan];

  // Enforce deadlift last (back+biceps rule)
  const deadliftIdx = merged.findIndex(e => e.exercise === "Deadlift");
  if (deadliftIdx !== -1) {
    const deadlift = merged.splice(deadliftIdx, 1)[0];
    merged.push(deadlift);
  }

  return merged;
}

module.exports = { getComboWorkout };
