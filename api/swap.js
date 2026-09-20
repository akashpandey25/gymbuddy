/**
 * api/swap.js
 * POST /api/swap
 * Vercel serverless function — no DB needed, pure engine logic
 */
const { findSwap } = require("../engine/swapEngine");

module.exports = function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { exercise, equipment } = req.body;

        if (!exercise) {
            return res.status(400).json({ error: "exercise name is required" });
        }

        const result = findSwap(exercise, equipment || []);

        if (!result.alternative) {
            return res.status(404).json({ error: result.message || "No swap found" });
        }

        res.json(result);
    } catch (err) {
        console.error("[POST /api/swap]", err.message);
        res.status(500).json({ error: err.message });
    }
};
