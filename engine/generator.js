/**
 * engine/generator.js
 * Main entry point — routes requests to the correct sub-engine.
 * Pure function: no DB, no Express.
 *
 * @param {Object}   params
 * @param {string}   params.mode         - "single" | "combo" | "split"
 * @param {string|string[]} params.target - muscle(s) or split type
 * @param {number}   params.time         - Available minutes
 * @param {string[]} params.equipment    - Available equipment
 * @param {Object}   [params.volumeState] - { muscle: { pattern: sets } } for this week
 * @returns {Object[]} workout plan
 */

const { getBackWorkout } = require("./muscle/back");
const { getChestWorkout } = require("./muscle/chest");
const { getLegWorkout } = require("./muscle/leg");
const { getShoulderWorkout } = require("./muscle/shoulders");
const { getBicepsWorkout } = require("./muscle/biceps");
const { getTricepsWorkout } = require("./muscle/triceps");
const { getComboWorkout } = require("./combo");
const { getSplitWorkout } = require("./splits");

function getSingleWorkout(target, time, equipment, volumeState) {
  switch (target.toLowerCase()) {
    case "back": return getBackWorkout(time, equipment, volumeState);
    case "chest": return getChestWorkout(time, equipment, volumeState);
    case "legs": return getLegWorkout(time, equipment, volumeState);
    case "shoulders": return getShoulderWorkout(time, equipment, volumeState);
    case "biceps": return getBicepsWorkout(time, equipment, volumeState);
    case "triceps": return getTricepsWorkout(time, equipment, volumeState);
    default:
      throw new Error(`Unknown muscle target: ${target}`);
  }
}

function generateWorkout({ mode, target, time, equipment = [], volumeState = {} }) {
  const t = parseInt(time, 10) || 45;
  const eq = equipment.map(e => e.toLowerCase());
  const m = (mode || "single").toLowerCase();

  switch (m) {
    case "single": {
      const muscle = Array.isArray(target) ? target[0] : target;
      return getSingleWorkout(muscle, t, eq, volumeState);
    }
    case "combo": {
      const targets = Array.isArray(target) ? target : [target];
      return getComboWorkout(targets, t, eq, volumeState);
    }
    case "split": {
      const splitType = Array.isArray(target) ? target[0] : target;
      return getSplitWorkout(splitType, t, eq, volumeState);
    }
    default:
      throw new Error(`Unknown mode: ${m}. Use single | combo | split`);
  }
}

module.exports = { generateWorkout };
