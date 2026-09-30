const pool = require("../../config/database");


// Get or create wishlist for a user
async function getOrCreateWishlist(userId) {
  const result = await pool.query(
    `
      INSERT INTO wishlists (user_id)
      VALUES ($1)

      ON CONFLICT (user_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP

      RETURNING
        id,
        user_id,
        created_at,
        updated_at
    `,
    [userId]
  );

  return result.rows[0];
}


// Get user's wishlist with product details
async function getWishlistByUserId(userId) {
  const result = await pool.query(
    `
      SELECT
        w.id AS wishlist_id,
        wi.id AS wishlist_item_id,
        wi.product_id,

        p.name,
        p.slug,
        p.description,
        p.brand,
        p.price,
        p.compare_at_price,
        p.stock_quantity,
        p.rating,
        p.review_count,

        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,

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
        ) AS image_url,

        wi.created_at

      FROM wishlists w

      INNER JOIN wishlist_items wi
        ON w.id = wi.wishlist_id

      INNER JOIN products p
        ON wi.product_id = p.id

      INNER JOIN categories c
        ON p.category_id = c.id

      WHERE w.user_id = $1
        AND p.is_active = TRUE

      ORDER BY wi.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}


// Add product to wishlist
async function addToWishlist(userId, productId) {
  const wishlist = await getOrCreateWishlist(userId);

  const result = await pool.query(
    `
      INSERT INTO wishlist_items (
        wishlist_id,
        product_id
      )
      VALUES ($1, $2)

      ON CONFLICT (wishlist_id, product_id)
      DO NOTHING

      RETURNING
        id,
        wishlist_id,
        product_id,
        created_at
    `,
    [wishlist.id, productId]
  );

  // Product was already in wishlist
  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}


// Remove product from wishlist
async function removeFromWishlist(userId, wishlistItemId) {
  const result = await pool.query(
    `
      DELETE FROM wishlist_items wi

      USING wishlists w

      WHERE wi.id = $1
        AND wi.wishlist_id = w.id
        AND w.user_id = $2

      RETURNING wi.id
    `,
    [wishlistItemId, userId]
  );

  return result.rows[0] || null;
}


// Clear user's wishlist
async function clearWishlist(userId) {
  const result = await pool.query(
    `
      DELETE FROM wishlist_items wi

      USING wishlists w

      WHERE wi.wishlist_id = w.id
        AND w.user_id = $1

      RETURNING wi.id
    `,
    [userId]
  );

  return result.rowCount;
}


module.exports = {
  getOrCreateWishlist,
  getWishlistByUserId,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};