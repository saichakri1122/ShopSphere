const pool = require("../../config/database");

async function addProductImage({
  productId,
  imageUrl,
  altText,
  displayOrder,
  isPrimary,
}) {
  const result = await pool.query(
    `
      INSERT INTO product_images (
        product_id,
        image_url,
        alt_text,
        display_order,
        is_primary
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        product_id,
        image_url,
        alt_text,
        display_order,
        is_primary,
        created_at
    `,
    [
      productId,
      imageUrl.trim(),
      altText?.trim() || null,
      displayOrder ?? 0,
      isPrimary ?? false,
    ]
  );

  return result.rows[0];
}

async function getProductImages(productId) {
  const result = await pool.query(
    `
      SELECT
        id,
        product_id,
        image_url,
        alt_text,
        display_order,
        is_primary,
        created_at
      FROM product_images
      WHERE product_id = $1
      ORDER BY display_order ASC, created_at ASC
    `,
    [productId]
  );

  return result.rows;
}

module.exports = {
  addProductImage,
  getProductImages,
};