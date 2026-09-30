const pool = require("../../config/database");

async function getAllCategories() {
  const result = await pool.query(`
    SELECT
      id,
      name,
      slug,
      description,
      image_url,
      is_active,
      created_at,
      updated_at
    FROM categories
    WHERE is_active = TRUE
    ORDER BY name ASC
  `);

  return result.rows;
}

async function getCategoryById(categoryId) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        slug,
        description,
        image_url,
        is_active,
        created_at,
        updated_at
      FROM categories
      WHERE id = $1
        AND is_active = TRUE
    `,
    [categoryId]
  );

  return result.rows[0] || null;
}

async function createCategory({
  name,
  slug,
  description,
  imageUrl,
}) {
  const result = await pool.query(
    `
      INSERT INTO categories (
        name,
        slug,
        description,
        image_url
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        slug,
        description,
        image_url,
        is_active,
        created_at,
        updated_at
    `,
    [
      name.trim(),
      slug.trim(),
      description?.trim() || null,
      imageUrl?.trim() || null,
    ]
  );

  return result.rows[0];
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
};