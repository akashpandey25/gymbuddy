/**
 * server/routes/log.js
 * POST /log
 * Inserts a workout log AND upserts weekly_volume per exercise (muscle + pattern + sets).
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * Get the ISO Monday (YYYY-MM-DD) for any given date.
 */
function getWeekStart(now = new Date()) {
    const d = new Date(now);
    const day = d.getDay();
    const diff = (day === 0) ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
}

/**
 * POST /log
 * Body: { mode, target, time_available, equipment, plan, user_id? }
 *
 * plan items should include: { exercise, muscle, pattern, sets, reps, ... }
 */
router.post("/", async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            mode,
            target,
            time_available,
            equipment,
            plan,
            user_id = "default"
        } = req.body;

        if (!plan || !Array.isArray(plan)) {
            return res.status(400).json({ error: "plan array is required" });
        }

        const targetArr = Array.isArray(target) ? target : [target];
        const equipArr = Array.isArray(equipment) ? equipment : (equipment ? [equipment] : []);

        await client.query("BEGIN");

        // ── 1. Insert workout log ─────────────────────────────────
        const logResult = await client.query(
            `INSERT INTO workout_logs
         (user_id, mode, target, time_available, equipment, plan)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
            [
                user_id,
                mode || "single",
                targetArr,
                parseInt(time_available, 10) || 0,
                equipArr,
                JSON.stringify(plan)
            ]
        );

        // ── 2. Upsert weekly_volume per exercise ──────────────────
        const weekStart = getWeekStart();

        for (const item of plan) {
            const muscle = (item.muscle || "").toLowerCase().trim();
            const pattern = (item.pattern || "").toLowerCase().trim();
            const sets = parseInt(item.sets, 10) || 0;

            if (!muscle || !pattern || sets <= 0) continue;

            await client.query(
                `INSERT INTO weekly_volume (user_id, week_start, muscle, pattern, sets)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, week_start, muscle, pattern)
         DO UPDATE SET sets = weekly_volume.sets + EXCLUDED.sets`,
                [user_id, weekStart, muscle, pattern, sets]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "Workout logged",
            id: logResult.rows[0].id,
            created_at: logResult.rows[0].created_at,
            week_start: weekStart
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("[POST /log]", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;
