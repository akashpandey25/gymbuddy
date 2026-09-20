/**
 * api/_db.js
 * Shared PostgreSQL pool for all Vercel serverless functions.
 * Uses a module-level singleton so connections are reused across
 * warm invocations within the same serverless instance.
 */
const { Pool } = require("pg");

let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 1,          // serverless: keep the pool tiny
            idleTimeoutMillis: 10000,
        });
    }
    return pool;
}

module.exports = { getPool };
