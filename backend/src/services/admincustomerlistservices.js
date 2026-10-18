const pool = require("../config/database");

async function getCustomerCount() {
  const result = await pool.query(`
    SELECT COUNT(*) AS total_customers
    FROM users
    WHERE role <> 'admin'
  `);

  return Number(result.rows[0].total_customers);
}

module.exports = {
  getCustomerCount,
};