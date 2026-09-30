const pool = require("../../config/database");

// =========================================================
// GET ALL ORDERS FOR USER
// =========================================================

async function getOrdersByUserId(userId) {
  const result = await pool.query(
    `
      SELECT
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.subtotal,
        o.shipping_fee,
        o.discount_amount,
        o.total_amount,

        o.shipping_full_name,
        o.shipping_phone,
        o.shipping_address_line1,
        o.shipping_address_line2,
        o.shipping_city,
        o.shipping_state,
        o.shipping_postal_code,
        o.shipping_country,

        o.created_at,
        o.updated_at,

        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_slug', oi.product_slug,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'total_price', oi.total_price
            )
            ORDER BY oi.created_at ASC
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items

      FROM orders o

      LEFT JOIN order_items oi
        ON o.id = oi.order_id

      WHERE o.user_id = $1

      GROUP BY o.id

      ORDER BY o.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}


// =========================================================
// GET ONE ORDER
// =========================================================

async function getOrderById(userId, orderId) {
  const result = await pool.query(
    `
      SELECT
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.subtotal,
        o.shipping_fee,
        o.discount_amount,
        o.total_amount,

        o.shipping_full_name,
        o.shipping_phone,
        o.shipping_address_line1,
        o.shipping_address_line2,
        o.shipping_city,
        o.shipping_state,
        o.shipping_postal_code,
        o.shipping_country,

        o.created_at,
        o.updated_at,

        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_slug', oi.product_slug,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'total_price', oi.total_price
            )
            ORDER BY oi.created_at ASC
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items

      FROM orders o

      LEFT JOIN order_items oi
        ON o.id = oi.order_id

      WHERE o.id = $1
        AND o.user_id = $2

      GROUP BY o.id
    `,
    [orderId, userId]
  );

  return result.rows[0] || null;
}


// =========================================================
// CREATE ORDER FROM CART
// =========================================================

async function createOrder(userId, addressId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // -----------------------------------------------------
    // 1. Get user's address
    // -----------------------------------------------------

    const addressResult = await client.query(
      `
        SELECT
          id,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country
        FROM addresses
        WHERE id = $1
          AND user_id = $2
      `,
      [addressId, userId]
    );

    const address = addressResult.rows[0];

    if (!address) {
      throw new Error("ADDRESS_NOT_FOUND");
    }


    // -----------------------------------------------------
    // 2. Get user's cart
    // -----------------------------------------------------

    const cartResult = await client.query(
      `
        SELECT id
        FROM carts
        WHERE user_id = $1
      `,
      [userId]
    );

    const cart = cartResult.rows[0];

    if (!cart) {
      throw new Error("CART_NOT_FOUND");
    }


    // -----------------------------------------------------
    // 3. Get cart items + current product data
    // -----------------------------------------------------

    const cartItemsResult = await client.query(
      `
        SELECT
          ci.id,
          ci.product_id,
          ci.quantity,

          p.name,
          p.slug,
          p.price,
          p.stock_quantity,
          p.is_active

        FROM cart_items ci

        INNER JOIN products p
          ON ci.product_id = p.id

        WHERE ci.cart_id = $1

        FOR UPDATE OF p
      `,
      [cart.id]
    );

    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      throw new Error("CART_EMPTY");
    }


    // -----------------------------------------------------
    // 4. Validate products + calculate subtotal
    // -----------------------------------------------------

    let subtotal = 0;

    for (const item of cartItems) {

      if (!item.is_active) {
        throw new Error(
          `PRODUCT_INACTIVE:${item.product_id}`
        );
      }

      if (item.stock_quantity < item.quantity) {
        throw new Error(
          `INSUFFICIENT_STOCK:${item.product_id}`
        );
      }

      subtotal += Number(item.price) * item.quantity;
    }


    // -----------------------------------------------------
    // 5. Calculate order totals
    // -----------------------------------------------------

    const shippingFee = 0;
    const discountAmount = 0;

    const totalAmount =
      subtotal +
      shippingFee -
      discountAmount;


    // -----------------------------------------------------
    // 6. Generate order number
    // -----------------------------------------------------

    const orderNumber = `SS-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;


    // -----------------------------------------------------
    // 7. Create order
    // -----------------------------------------------------

    const orderResult = await client.query(
      `
        INSERT INTO orders (
          user_id,
          address_id,
          order_number,

          status,
          payment_status,

          subtotal,
          shipping_fee,
          discount_amount,
          total_amount,

          shipping_full_name,
          shipping_phone,
          shipping_address_line1,
          shipping_address_line2,
          shipping_city,
          shipping_state,
          shipping_postal_code,
          shipping_country
        )

        VALUES (
          $1,
          $2,
          $3,

          'pending',
          'pending',

          $4,
          $5,
          $6,
          $7,

          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15
        )

        RETURNING
          id,
          order_number,
          status,
          payment_status,
          subtotal,
          shipping_fee,
          discount_amount,
          total_amount,
          created_at
      `,
      [
        userId,
        address.id,
        orderNumber,

        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,

        address.full_name,
        address.phone,
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.postal_code,
        address.country,
      ]
    );

    const order = orderResult.rows[0];


    // -----------------------------------------------------
    // 8. Create order items
    // -----------------------------------------------------

    for (const item of cartItems) {

      const itemTotal =
        Number(item.price) * item.quantity;

      await client.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            product_slug,
            quantity,
            unit_price,
            total_price
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
        `,
        [
          order.id,
          item.product_id,
          item.name,
          item.slug,
          item.quantity,
          item.price,
          itemTotal,
        ]
      );


      // ---------------------------------------------------
      // 9. Reduce product stock
      // ---------------------------------------------------

      await client.query(
        `
          UPDATE products

          SET
            stock_quantity = stock_quantity - $1,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $2
        `,
        [
          item.quantity,
          item.product_id,
        ]
      );
    }


    // -----------------------------------------------------
    // 10. Clear cart
    // -----------------------------------------------------

    await client.query(
      `
        DELETE FROM cart_items
        WHERE cart_id = $1
      `,
      [cart.id]
    );


    await client.query("COMMIT");

    return order;

  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();
  }
}


// =========================================================
// CANCEL ORDER
// =========================================================

async function cancelOrder(userId, orderId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // -----------------------------------------------------
    // 1. Get order
    // -----------------------------------------------------

    const orderResult = await client.query(
      `
        SELECT
          id,
          status
        FROM orders
        WHERE id = $1
          AND user_id = $2
        FOR UPDATE
      `,
      [orderId, userId]
    );

    const order = orderResult.rows[0];

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }


    // -----------------------------------------------------
    // 2. Check cancellation status
    // -----------------------------------------------------

    if (
      order.status !== "pending" &&
      order.status !== "confirmed"
    ) {
      throw new Error("ORDER_CANNOT_BE_CANCELLED");
    }


    // -----------------------------------------------------
    // 3. Get order items
    // -----------------------------------------------------

    const itemsResult = await client.query(
      `
        SELECT
          product_id,
          quantity
        FROM order_items
        WHERE order_id = $1
          AND product_id IS NOT NULL
      `,
      [orderId]
    );


    // -----------------------------------------------------
    // 4. Restore stock
    // -----------------------------------------------------

    for (const item of itemsResult.rows) {

      await client.query(
        `
          UPDATE products

          SET
            stock_quantity = stock_quantity + $1,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $2
        `,
        [
          item.quantity,
          item.product_id,
        ]
      );
    }


    // -----------------------------------------------------
    // 5. Cancel order
    // -----------------------------------------------------

    const updateResult = await client.query(
      `
        UPDATE orders

        SET
          status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $1

        RETURNING
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          updated_at
      `,
      [orderId]
    );


    await client.query("COMMIT");

    return updateResult.rows[0];

  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();
  }
}


module.exports = {
  getOrdersByUserId,
  getOrderById,
  createOrder,
  cancelOrder,
};