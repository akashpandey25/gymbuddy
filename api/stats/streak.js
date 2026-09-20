/**
 * api/stats/streak.js
 * GET /api/stats/streak?user_id=default
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = rows.map(r => {
            const d = new Date(r.workout_date);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        });

        let streak = 0;
        let current = today.getTime();
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
        console.error("[GET /api/stats/streak]", err.message);
        res.status(500).json({ error: err.message });
    }
};
