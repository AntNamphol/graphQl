const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT || 5432,
});

pool.on("connect", () => console.log("✅ PostgreSQL connected"));
pool.on("error", (err) => console.error("❌ DB error:", err));

module.exports = pool;
