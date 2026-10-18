
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testDatabaseConnection() {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database_name,
        current_schema() AS schema_name,
        current_setting('search_path') AS search_path,
        to_regclass('users') AS users_table
    `);

    console.log("DATABASE CHECK:", result.rows[0]);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

testDatabaseConnection();

module.exports = pool;
