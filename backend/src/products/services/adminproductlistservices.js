const pool = require("../../config/database");

async function getAllProducts() {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.category_id,
      c.name AS category_name,
      p.brand,
      p.price,
      p.compare_at_price,
      p.stock_quantity,
      p.rating,
      p.review_count,
      p.is_featured,
      p.is_new_arrival,
      p.is_essential,
      p.is_active,
      p.created_at,
      p.updated_at
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);

  return result.rows;
}

module.exports = {
  getAllProducts,
};