const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const generateRoute = require("./routes/generate");
const swapRoute = require("./routes/swap");
const logRoute = require("./routes/log");
const historyRoute = require("./routes/history");

const app = express();
app.use(express.json());
app.use(cors());

// ── Health check ─────────────────────────────────────────────
app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "connected", time: result.rows[0] });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// ── Core Routes ───────────────────────────────────────────────
app.use("/generate", generateRoute);
app.use("/swap", swapRoute);
app.use("/log", logRoute);
app.use("/history", historyRoute);

// /equipment-options is served from the generate router
// GET /equipment-options?muscle=<name>

// ── 404 fallback ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`GymBrain server running on port ${PORT}`));
