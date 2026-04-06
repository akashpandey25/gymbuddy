const express = require("express");
const router = express.Router();
const { findSwap } = require("../../engine/swapEngine");

/**
 * POST /swap
 * Body: { exercise, equipment }
 */
router.post("/", (req, res) => {
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
        console.error("[/swap]", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
