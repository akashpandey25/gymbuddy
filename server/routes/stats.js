/**
 * server/routes/stats.js
 * GET /stats/weekly   — weekly volume per muscle (sets grouped by muscle)
 * GET /stats/streak   — consecutive workout days streak
 * GET /stats/summary  — total this month, top muscle
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");

// ─────────────────────────────────────────────────────────────────────────────
// GET /stats/weekly?user_id=default
// Returns this week's accumulated sets per muscle
// ─────────────────────────────────────────────────────────────────────────────
router.get("/weekly", async (req, res) => {
    try {
        const user_id = req.query.user_id || "default";

        // Get ISO Monday for current week
        const now = new Date();
        const day = now.getDay();
        const diff = (day === 0) ? -6 : 1 - day;
        now.setDate(now.getDate() + diff);
        const weekStart = now.toISOString().slice(0, 10);

        const { rows } = await pool.query(
            `SELECT muscle, SUM(sets) AS total_sets
             FROM weekly_volume
             WHERE user_id = $1 AND week_start = $2
             GROUP BY muscle
             ORDER BY total_sets DESC`,
            [user_id, weekStart]
        );

        res.json({ week_start: weekStart, muscles: rows });
    } catch (err) {
        console.error("[GET /stats/weekly]", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /stats/streak?user_id=default
// Returns the current consecutive-day streak (days in a row with at least 1 log)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/streak", async (req, res) => {
    try {
        const user_id = req.query.user_id || "default";

        // Get distinct dates worked out, last 60 days
        const { rows } = await pool.query(
            `SELECT DISTINCT DATE(created_at AT TIME ZONE 'Asia/Kolkata') AS workout_date
             FROM workout_logs
             WHERE user_id = $1
               AND created_at >= NOW() - INTERVAL '60 days'
             ORDER BY workout_date DESC`,
            [user_id]
        );

        if (rows.length === 0) {
            return res.json({ streak: 0, last_workout: null });
        }

        // Walk backwards from today, count consecutive days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = rows.map(r => {
            const d = new Date(r.workout_date);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        });

        let streak = 0;
        let current = today.getTime();

        // Allow today or yesterday as streak start (gym might be done later today)
        const yesterday = current - 86400000;
        if (!dates.includes(current) && !dates.includes(yesterday)) {
            return res.json({ streak: 0, last_workout: rows[0].workout_date });
        }

        if (!dates.includes(current)) current = yesterday;

        for (const d of dates) {
            if (d === current) {
                streak++;
                current -= 86400000;
            } else if (d < current) {
                break;
            }
        }

        res.json({ streak, last_workout: rows[0].workout_date });
    } catch (err) {
        console.error("[GET /stats/streak]", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /stats/summary?user_id=default
// Returns: total_this_month, top_muscle_this_month, all_time_total
// ─────────────────────────────────────────────────────────────────────────────
router.get("/summary", async (req, res) => {
    try {
        const user_id = req.query.user_id || "default";

        // Total workouts this month
        const monthResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM workout_logs
             WHERE user_id = $1
               AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
            [user_id]
        );

        // All-time total
        const allTimeResult = await pool.query(
            `SELECT COUNT(*) AS total FROM workout_logs WHERE user_id = $1`,
            [user_id]
        );

        // Top muscle this month (by sets in weekly_volume)
        const topMuscleResult = await pool.query(
            `SELECT muscle, SUM(sets) AS total_sets
             FROM weekly_volume
             WHERE user_id = $1
               AND week_start >= DATE_TRUNC('month', NOW())::DATE
             GROUP BY muscle
             ORDER BY total_sets DESC
             LIMIT 1`,
            [user_id]
        );

        res.json({
            total_this_month: parseInt(monthResult.rows[0].total, 10),
            all_time_total: parseInt(allTimeResult.rows[0].total, 10),
            top_muscle: topMuscleResult.rows[0]?.muscle || null,
            top_muscle_sets: topMuscleResult.rows[0]?.total_sets || 0,
        });
    } catch (err) {
        console.error("[GET /stats/summary]", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
