const pool = require("../../config/database");

async function getAllProducts() {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
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

      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,

      COALESCE(
        json_agg(
          json_build_object(
            'id', pi.id,
            'image_url', pi.image_url,
            'alt_text', pi.alt_text,
            'display_order', pi.display_order,
            'is_primary', pi.is_primary
          )
          ORDER BY pi.display_order
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) AS images

    FROM products p

    INNER JOIN categories c
      ON p.category_id = c.id

    LEFT JOIN product_images pi
      ON p.id = pi.product_id

    WHERE p.is_active = TRUE

    GROUP BY
      p.id,
      c.id

    ORDER BY p.created_at DESC
  `);

  return result.rows;
}

async function getProductById(productId) {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
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

        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,

        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'display_order', pi.display_order,
              'is_primary', pi.is_primary
            )
            ORDER BY pi.display_order
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) AS images

      FROM products p

      INNER JOIN categories c
        ON p.category_id = c.id

      LEFT JOIN product_images pi
        ON p.id = pi.product_id

      WHERE p.id = $1
        AND p.is_active = TRUE

      GROUP BY
        p.id,
        c.id
    `,
    [productId]
  );

  return result.rows[0] || null;
}

async function createProduct({
  name,
  slug,
  description,
  brand,
  categoryId,
  price,
  compareAtPrice,
  stockQuantity,
  rating,
  reviewCount,
  isFeatured,
  isNewArrival,
  isEssential,
}) {
  const result = await pool.query(
    `
      INSERT INTO products (
        category_id,
        name,
        slug,
        description,
        brand,
        price,
        compare_at_price,
        stock_quantity,
        rating,
        review_count,
        is_featured,
        is_new_arrival,
        is_essential
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )
      RETURNING
        id,
        category_id,
        name,
        slug,
        description,
        brand,
        price,
        compare_at_price,
        stock_quantity,
        rating,
        review_count,
        is_featured,
        is_new_arrival,
        is_essential,
        is_active,
        created_at,
        updated_at
    `,
    [
      categoryId,
      name.trim(),
      slug.trim(),
      description?.trim() || null,
      brand?.trim() || null,
      price,
      compareAtPrice ?? null,
      stockQuantity,
      rating ?? 0,
      reviewCount ?? 0,
      isFeatured ?? false,
      isNewArrival ?? false,
      isEssential ?? false,
    ]
  );

  return result.rows[0];
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
};
