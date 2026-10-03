const pool = require("../../config/database");

async function createProduct(data) {
  const {
    name,
    slug,
    description,
    category_id,
    price,
    compare_at_price,
    stock_quantity,
    brand,
    is_featured = false,
    is_new_arrival = false,
    is_essential = false,
    is_active = true,
  } = data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check category
    const categoryResult = await client.query(
      `
      SELECT id
      FROM categories
      WHERE id = $1
      `,
      [category_id]
    );

    if (categoryResult.rowCount === 0) {
      const error = new Error("Category not found");
      error.code = "CATEGORY_NOT_FOUND";
      throw error;
    }

    // Check duplicate slug
    const existingProduct = await client.query(
      `
      SELECT id
      FROM products
      WHERE slug = $1
      `,
      [slug]
    );

    if (existingProduct.rowCount > 0) {
      const error = new Error("Product slug already exists");
      error.code = "DUPLICATE_SLUG";
      throw error;
    }

    // Create product
    const result = await client.query(
      `
      INSERT INTO products (
        name,
        slug,
        description,
        category_id,
        price,
        compare_at_price,
        stock_quantity,
        brand,
        is_featured,
        is_new_arrival,
        is_essential,
        is_active
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12
      )
      RETURNING *
      `,
      [
        name,
        slug,
        description || null,
        category_id,
        price,
        compare_at_price || null,
        stock_quantity,
        brand || null,
        is_featured,
        is_new_arrival,
        is_essential,
        is_active,
      ]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createProduct,
};