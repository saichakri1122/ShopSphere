const pool = require("../../config/database");

async function deleteProduct(productId) {
  const result = await pool.query(
    `
    DELETE FROM products
    WHERE id = $1
    RETURNING id, name, slug
    `,
    [productId]
  );

  if (result.rowCount === 0) {
    const error = new Error("Product not found");
    error.code = "PRODUCT_NOT_FOUND";
    throw error;
  }

  return result.rows[0];
}

module.exports = {
  deleteProduct,
};