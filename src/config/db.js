const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  queueLimit: 0
});

// Convert callbacks to promises
const promisePool = pool.promise();

// Test connection immediately
promisePool
  .query("SELECT 1")
  .then(() => {
    console.log("✅ MySQL Database Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MySQL Connection Failed:", err.message);
    process.exit(1); // stop app if DB fails
  });

module.exports = promisePool;
