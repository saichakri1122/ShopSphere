const pool = require("../../config/database");

async function updateProduct(productId, data) {
  const {
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
    is_active,
  } = data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check product exists
    const productResult = await client.query(
      `
      SELECT id
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
      [productId]
    );

    if (productResult.rowCount === 0) {
      const error = new Error("Product not found");
      error.code = "PRODUCT_NOT_FOUND";
      throw error;
    }

    // Check category
    if (category_id) {
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
    }

    // Check duplicate slug
    if (slug) {
      const slugResult = await client.query(
        `
        SELECT id
        FROM products
        WHERE slug = $1
          AND id <> $2
        `,
        [slug, productId]
      );

      if (slugResult.rowCount > 0) {
        const error = new Error("Product slug already exists");
        error.code = "DUPLICATE_SLUG";
        throw error;
      }
    }

    const result = await client.query(
      `
      UPDATE products
      SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        category_id = COALESCE($4, category_id),
        price = COALESCE($5, price),
        compare_at_price = COALESCE($6, compare_at_price),
        stock_quantity = COALESCE($7, stock_quantity),
        brand = COALESCE($8, brand),
        is_featured = COALESCE($9, is_featured),
        is_new_arrival = COALESCE($10, is_new_arrival),
        is_essential = COALESCE($11, is_essential),
        is_active = COALESCE($12, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
      `,
      [
        name ?? null,
        slug ?? null,
        description ?? null,
        category_id ?? null,
        price ?? null,
        compare_at_price ?? null,
        stock_quantity ?? null,
        brand ?? null,
        is_featured ?? null,
        is_new_arrival ?? null,
        is_essential ?? null,
        is_active ?? null,
        productId,
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
  updateProduct,
};