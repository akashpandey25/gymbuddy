/**
 * api/stats/summary.js
 * GET /api/stats/summary?user_id=default
 */
const { getPool } = require("../_db");

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const user_id = req.query.user_id || "default";
        const pool = getPool();

        const [monthResult, allTimeResult, topMuscleResult] = await Promise.all([
            pool.query(
                `SELECT COUNT(*) AS total
                 FROM workout_logs
                 WHERE user_id = $1
                   AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`,
                [user_id]
            ),
            pool.query(
                `SELECT COUNT(*) AS total FROM workout_logs WHERE user_id = $1`,
                [user_id]
            ),
            pool.query(
                `SELECT muscle, SUM(sets) AS total_sets
                 FROM weekly_volume
                 WHERE user_id = $1
                   AND week_start >= DATE_TRUNC('month', NOW())::DATE
                 GROUP BY muscle
                 ORDER BY total_sets DESC
                 LIMIT 1`,
                [user_id]
            ),
        ]);

        res.json({
            total_this_month: parseInt(monthResult.rows[0].total, 10),
            all_time_total:   parseInt(allTimeResult.rows[0].total, 10),
            top_muscle:       topMuscleResult.rows[0]?.muscle || null,
            top_muscle_sets:  topMuscleResult.rows[0]?.total_sets || 0,
        });
    } catch (err) {
        console.error("[GET /api/stats/summary]", err.message);
        res.status(500).json({ error: err.message });
    }
};
