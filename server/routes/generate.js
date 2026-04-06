/**
 * server/routes/generate.js
 * POST /generate  — generate a workout plan (volume-guarded)
 * GET  /equipment-options?muscle=<name> — dynamic equipment list
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { generateWorkout } = require("../../engine/generator");

// Pull exercise arrays for /equipment-options
const { backExercises } = require("../../engine/muscle/back");
const { chestExercises } = require("../../engine/muscle/chest");
const { legExercises } = require("../../engine/muscle/leg");
const { shoulderExercises } = require("../../engine/muscle/shoulders");
const { bicepsExercises } = require("../../engine/muscle/biceps");
const { tricepsExercises } = require("../../engine/muscle/triceps");

const MUSCLE_EXERCISES = {
    back: backExercises,
    chest: chestExercises,
    legs: legExercises,
    shoulders: shoulderExercises,
    biceps: bicepsExercises,
    triceps: tricepsExercises
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the ISO Monday (YYYY-MM-DD) for any given date.
 */
function getWeekStart(now = new Date()) {
    const d = new Date(now);
    const day = d.getDay(); // 0=Sun … 6=Sat
    const diff = (day === 0) ? -6 : 1 - day; // shift to Monday
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Fetch this week's volume from weekly_volume and build volumeState.
 * Shape: { muscle: { pattern: sets } }
 */
async function fetchVolumeState(userId, weekStart) {
    try {
        const { rows } = await pool.query(
            `SELECT muscle, pattern, sets
         FROM weekly_volume
        WHERE user_id = $1 AND week_start = $2`,
            [userId, weekStart]
        );

        const state = {};
        for (const row of rows) {
            if (!state[row.muscle]) state[row.muscle] = {};
            state[row.muscle][row.pattern] = row.sets;
        }
        return state;
    } catch {
        // Non-fatal: if DB unavailable, proceed without volume guard
        return {};
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /generate
// Body: { mode, target, time, equipment, user_id? }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { mode, target, time, equipment, user_id = "default" } = req.body;

        if (!mode) return res.status(400).json({ error: "mode is required (single | combo | split)" });
        if (!time) return res.status(400).json({ error: "time is required (minutes)" });

        // Accept string or array, reject empty
        const targetArr = Array.isArray(target) ? target : (target ? [target] : []);
        if (targetArr.length === 0) {
            return res.status(400).json({ error: "target is required (muscle or split type)" });
        }

        const weekStart = getWeekStart();
        const volumeState = await fetchVolumeState(user_id, weekStart);

        const plan = generateWorkout({
            mode,
            target: targetArr,
            time: parseInt(time, 10),
            equipment: equipment || [],
            volumeState
        });

        res.json(plan);
    } catch (err) {
        console.error("[POST /generate]", err.message, "\n", err.stack);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /equipment-options?muscle=<name>
// Returns unique equipment strings for the requested muscle's exercise list
// ─────────────────────────────────────────────────────────────────────────────
router.get("/equipment-options", (req, res) => {
    const muscle = (req.query.muscle || "").toLowerCase();

    if (!muscle) {
        return res.status(400).json({ error: "muscle query param is required" });
    }

    const exercises = MUSCLE_EXERCISES[muscle];
    if (!exercises) {
        return res.status(404).json({
            error: `Unknown muscle: ${muscle}. Use: ${Object.keys(MUSCLE_EXERCISES).join(", ")}`
        });
    }

    const equipmentSet = new Set();
    for (const ex of exercises) {
        for (const eq of ex.equipment) {
            equipmentSet.add(eq.toLowerCase());
        }
    }

    res.json({ muscle, equipment: [...equipmentSet].sort() });
});

module.exports = router;
