/**
 * api/history.js
 * GET /api/history?user_id=default&limit=20
 * Vercel serverless function
 */
const { getPool } = require("./_db");

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const user_id = req.query.user_id || "default";
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
        const pool = getPool();

        const result = await pool.query(
            `SELECT id, mode, target, time_available, equipment, plan, created_at
             FROM workout_logs
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [user_id, limit]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("[GET /api/history]", err.message);
        res.status(500).json({ error: err.message });
    }
};
