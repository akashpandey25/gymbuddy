/**
 * api/generate/equipment-options.js
 * GET /api/generate/equipment-options?muscle=<name>
 * Vercel serverless function
 */
const { backExercises }     = require("../../engine/muscle/back");
const { chestExercises }    = require("../../engine/muscle/chest");
const { legExercises }      = require("../../engine/muscle/leg");
const { shoulderExercises } = require("../../engine/muscle/shoulders");
const { bicepsExercises }   = require("../../engine/muscle/biceps");
const { tricepsExercises }  = require("../../engine/muscle/triceps");

const MUSCLE_EXERCISES = {
    back:      backExercises,
    chest:     chestExercises,
    legs:      legExercises,
    shoulders: shoulderExercises,
    biceps:    bicepsExercises,
    triceps:   tricepsExercises,
};

module.exports = function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    const muscle = (req.query.muscle || "").toLowerCase();
    if (!muscle) {
        return res.status(400).json({ error: "muscle query param is required" });
    }

    const exercises = MUSCLE_EXERCISES[muscle];
    if (!exercises) {
        return res.status(404).json({
            error: `Unknown muscle: ${muscle}. Use: ${Object.keys(MUSCLE_EXERCISES).join(", ")}`,
        });
    }

    const equipmentSet = new Set();
    for (const ex of exercises) {
        for (const eq of ex.equipment) {
            equipmentSet.add(eq.toLowerCase());
        }
    }

    res.json({ muscle, equipment: [...equipmentSet].sort() });
};
