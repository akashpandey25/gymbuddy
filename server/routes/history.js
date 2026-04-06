const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * GET /history?user_id=default&limit=10
 */
router.get("/", async (req, res) => {
    try {
        const user_id = req.query.user_id || "default";
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

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
        console.error("[/history]", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
