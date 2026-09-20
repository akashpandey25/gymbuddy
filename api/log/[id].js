/**
 * api/log/[id].js
 * DELETE /api/log/:id?user_id=default
 * Vercel serverless function — dynamic route for deleting a log entry
 */
const { getPool } = require("../_db");

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { id } = req.query;
        const user_id = req.query.user_id || "default";
        const pool = getPool();

        const result = await pool.query(
            `DELETE FROM workout_logs WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Log entry not found" });
        }

        res.json({ message: "Log deleted", id: result.rows[0].id });
    } catch (err) {
        console.error("[DELETE /api/log/:id]", err.message);
        res.status(500).json({ error: err.message });
    }
};
