/**
 * api/generate.js
 * POST /api/generate
 * Vercel serverless function — mirrors server/routes/generate.js
 */
const { getPool } = require("./_db");
const { generateWorkout } = require("../engine/generator");

function getWeekStart(now = new Date()) {
    const d = new Date(now);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
}

async function fetchVolumeState(userId, weekStart) {
    try {
        const pool = getPool();
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
        return {};
    }
}

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { mode, target, time, equipment, user_id = "default" } = req.body;

        if (!mode) return res.status(400).json({ error: "mode is required" });
        if (!time) return res.status(400).json({ error: "time is required" });

        const targetArr = Array.isArray(target) ? target : target ? [target] : [];
        if (targetArr.length === 0) {
            return res.status(400).json({ error: "target is required" });
        }

        const weekStart = getWeekStart();
        const volumeState = await fetchVolumeState(user_id, weekStart);

        const plan = generateWorkout({
            mode,
            target: targetArr,
            time: parseInt(time, 10),
            equipment: equipment || [],
            volumeState,
        });

        res.json(plan);
    } catch (err) {
        console.error("[POST /api/generate]", err.message);
        res.status(500).json({ error: err.message });
    }
};
