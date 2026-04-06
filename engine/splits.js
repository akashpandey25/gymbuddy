/**
 * engine/splits.js
 * Split workout generator — Push / Pull / Legs / Full-Body.
 * Pattern-aware: each muscle group contributes one exercise per primary pattern.
 *
 * Push:      chest + shoulders + triceps
 * Pull:      back + biceps
 * Legs:      legs only
 * Full-body: 1 push pattern + 1 pull pattern + 1 knee-dominant pattern
 */

const { getChestWorkout } = require("./muscle/chest");
const { getShoulderWorkout } = require("./muscle/shoulders");
const { getTricepsWorkout } = require("./muscle/triceps");
const { getBackWorkout } = require("./muscle/back");
const { getBicepsWorkout } = require("./muscle/biceps");
const { getLegWorkout } = require("./muscle/leg");

/**
 * Divide time proportionally across N muscle groups.
 */
function splitTime(time, groups) {
    const per = Math.floor(time / groups);
    return Array(groups).fill(per);
}

/**
 * Get a split-type workout.
 * @param {string}   splitType   - "push" | "pull" | "legs" | "fullbody"
 * @param {number}   time        - Total available minutes
 * @param {string[]} equipment   - Available equipment
 * @param {Object}   [volumeState]
 * @returns {Object[]} workout plan
 */
function getSplitWorkout(splitType, time, equipment, volumeState = {}) {
    switch (splitType.toLowerCase()) {

        case "push": {
            // chest → shoulders → triceps
            const [tChest, tShoulder, tTriceps] = splitTime(time, 3);
            const chestPlan = getChestWorkout(tChest, equipment, volumeState, []);
            const usedAfterC = chestPlan.map(e => e.pattern);
            const shoulderPlan = getShoulderWorkout(tShoulder, equipment, volumeState, usedAfterC);
            const usedAfterS = [...usedAfterC, ...shoulderPlan.map(e => e.pattern)];
            const tricepsPlan = getTricepsWorkout(tTriceps, equipment, volumeState, usedAfterS);
            return [...chestPlan, ...shoulderPlan, ...tricepsPlan];
        }

        case "pull": {
            // back → biceps, deadlift last
            const [tBack, tBiceps] = splitTime(time, 2);
            const backPlan = getBackWorkout(tBack, equipment, volumeState, []);
            const usedAfterB = backPlan.map(e => e.pattern);
            const bicepsPlan = getBicepsWorkout(tBiceps, equipment, volumeState, usedAfterB);
            let merged = [...backPlan, ...bicepsPlan];
            // Deadlift stays last
            const dlIdx = merged.findIndex(e => e.exercise === "Deadlift");
            if (dlIdx !== -1) {
                const dl = merged.splice(dlIdx, 1)[0];
                merged.push(dl);
            }
            return merged;
        }

        case "legs":
            return getLegWorkout(time, equipment, volumeState, []);

        case "fullbody": {
            // 1 chest exercise (push), 1 back exercise (pull), 1 leg exercise (knee_dominant)
            const perGroup = Math.floor(time / 3);

            // Give enough time to get 1 exercise from each; cap at 25 min per group
            const t = Math.min(perGroup, 30);

            const chestPlan = getChestWorkout(t, equipment, volumeState, []).slice(0, 1);
            const usedC = chestPlan.map(e => e.pattern);
            const backPlan = getBackWorkout(t, equipment, volumeState, usedC).slice(0, 1);
            const usedCB = [...usedC, ...backPlan.map(e => e.pattern)];
            const legPlan = getLegWorkout(t, equipment, volumeState, usedCB).slice(0, 1);

            return [...chestPlan, ...backPlan, ...legPlan];
        }

        default:
            throw new Error(`Unknown split type: ${splitType}. Use push | pull | legs | fullbody`);
    }
}

module.exports = { getSplitWorkout };
