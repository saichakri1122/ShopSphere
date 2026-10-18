
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
      p.updated_at,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'display_order', pi.display_order,
              'is_primary', pi.is_primary
            )
            ORDER BY pi.display_order ASC, pi.id ASC
          )
          FROM product_images pi
          WHERE pi.product_id = p.id
        ),
        '[]'::json
      ) AS images
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);

  return result.rows;
}

async function getActiveProductCount() {
  const result = await pool.query(`
    SELECT COUNT(*) AS total_products
    FROM products
    WHERE is_active = TRUE
  `);

  return Number(result.rows[0].total_products);
}

module.exports = {
  getAllProducts,
  getActiveProductCount,
};
