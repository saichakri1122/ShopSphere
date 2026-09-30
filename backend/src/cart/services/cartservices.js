const pool = require("../../config/database");

// Get the user's cart with product details
async function getCartByUserId(userId) {
  const result = await pool.query(
    `
      SELECT
        c.id AS cart_id,
        ci.id AS cart_item_id,
        ci.product_id,
        ci.quantity,

        p.name,
        p.slug,
        p.price,
        p.compare_at_price,
        p.stock_quantity,

        COALESCE(
          (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
              AND pi.is_primary = TRUE
            LIMIT 1
          ),
          (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi.display_order ASC
            LIMIT 1
          )
        ) AS image_url

      FROM carts c

      LEFT JOIN cart_items ci
        ON c.id = ci.cart_id

      LEFT JOIN products p
        ON ci.product_id = p.id

      WHERE c.user_id = $1

      ORDER BY ci.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}


// Get or create a cart for a user
async function getOrCreateCart(userId) {
  const result = await pool.query(
    `
      INSERT INTO carts (user_id)
      VALUES ($1)
      ON CONFLICT (user_id)
      DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, created_at, updated_at
    `,
    [userId]
  );

  return result.rows[0];
}


// Add product to cart
async function addToCart(userId, productId, quantity) {
  const cart = await getOrCreateCart(userId);

  const result = await pool.query(
    `
      INSERT INTO cart_items (
        cart_id,
        product_id,
        quantity
      )
      VALUES ($1, $2, $3)

      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP

      RETURNING
        id,
        cart_id,
        product_id,
        quantity,
        created_at,
        updated_at
    `,
    [cart.id, productId, quantity]
  );

  return result.rows[0];
}


// Update product quantity
async function updateCartItem(userId, cartItemId, quantity) {
  const result = await pool.query(
    `
      UPDATE cart_items ci

      SET
        quantity = $1,
        updated_at = CURRENT_TIMESTAMP

      FROM carts c

      WHERE ci.id = $2
        AND ci.cart_id = c.id
        AND c.user_id = $3

      RETURNING
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        ci.created_at,
        ci.updated_at
    `,
    [quantity, cartItemId, userId]
  );

  return result.rows[0] || null;
}


// Remove product from cart
async function removeFromCart(userId, cartItemId) {
  const result = await pool.query(
    `
      DELETE FROM cart_items ci

      USING carts c

      WHERE ci.id = $1
        AND ci.cart_id = c.id
        AND c.user_id = $2

      RETURNING ci.id
    `,
    [cartItemId, userId]
  );

  return result.rows[0] || null;
}


// Clear user's cart
async function clearCart(userId) {
  const result = await pool.query(
    `
      DELETE FROM cart_items ci

      USING carts c

      WHERE ci.cart_id = c.id
        AND c.user_id = $1

      RETURNING ci.id
    `,
    [userId]
  );

  return result.rowCount;
}


module.exports = {
  getCartByUserId,
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};