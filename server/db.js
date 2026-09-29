require("dotenv").config();

const { Pool } = require("pg");

let pool;

if (process.env.DATABASE_URL) {
  // Production: Neon PostgreSQL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Local development: PostgreSQL on your laptop
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  });
}

module.exports = pool;