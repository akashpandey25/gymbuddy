/**
 * api/stats/weekly.js
 * GET /api/stats/weekly?user_id=default
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

        const now = new Date();
        const day = now.getDay();
        const diff = day === 0 ? -6 : 1 - day;
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
        console.error("[GET /api/stats/weekly]", err.message);
        res.status(500).json({ error: err.message });
    }
};
