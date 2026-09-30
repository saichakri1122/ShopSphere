const pool = require("../../config/database");

const {
  createPaymentOrder,
  simulateSuccessfulPayment,
  simulateFailedPayment,
} = require("./mockpaymentgateway");

// =========================================================
// CREATE PAYMENT ATTEMPT
// =========================================================

async function createPaymentAttempt(userId, orderId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // -----------------------------------------------------
    // 1. Get and lock order
    // -----------------------------------------------------

    const orderResult = await client.query(
      `
        SELECT
          id,
          order_number,
          total_amount,
          payment_status,
          status,
          stock_reserved_until
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
    // 2. Prevent payment after successful payment
    // -----------------------------------------------------

    if (order.payment_status === "paid") {
      throw new Error("ORDER_ALREADY_PAID");
    }

    // -----------------------------------------------------
    // 3. Order must still be pending
    // -----------------------------------------------------

    if (order.status !== "pending") {
      throw new Error("ORDER_NOT_AVAILABLE_FOR_PAYMENT");
    }

    // -----------------------------------------------------
    // 4. Check stock reservation expiry
    // -----------------------------------------------------

    if (!order.stock_reserved_until) {
      throw new Error("STOCK_RESERVATION_NOT_ACTIVE");
    }

    if (
      new Date(order.stock_reserved_until) <= new Date()
    ) {
      throw new Error("STOCK_RESERVATION_EXPIRED");
    }

    // -----------------------------------------------------
    // 5. Check existing successful payment
    // -----------------------------------------------------

    const paidPaymentResult = await client.query(
      `
        SELECT
          id
        FROM payments
        WHERE order_id = $1
          AND status = 'paid'
        LIMIT 1
      `,
      [orderId]
    );

    if (paidPaymentResult.rows.length > 0) {
      throw new Error("ORDER_ALREADY_PAID");
    }

    // -----------------------------------------------------
    // 6. Create payment record
    // -----------------------------------------------------

    const paymentResult = await client.query(
      `
        INSERT INTO payments (
          order_id,
          amount,
          currency,
          status
        )
        VALUES (
          $1,
          $2,
          'INR',
          'created'
        )
        RETURNING
          id,
          order_id,
          amount,
          currency,
          status,
          created_at
      `,
      [
        orderId,
        order.total_amount,
      ]
    );

    const payment = paymentResult.rows[0];

    // -----------------------------------------------------
    // 7. Create payment order through mock gateway
    // -----------------------------------------------------

    const gatewayOrder =
      await createPaymentOrder({
        orderId: order.id,
        amount: order.total_amount,
        currency: "INR",
      });

    // -----------------------------------------------------
    // 8. Store gateway order ID
    // -----------------------------------------------------

    const updatedPaymentResult = await client.query(
      `
        UPDATE payments
        SET
          razorpay_order_id = $1,
          status = 'pending',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING
          id,
          order_id,
          razorpay_order_id,
          amount,
          currency,
          status,
          created_at,
          updated_at
      `,
      [
        gatewayOrder.gatewayOrderId,
        payment.id,
      ]
    );

    await client.query("COMMIT");

    return updatedPaymentResult.rows[0];

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
}

// =========================================================
// GET PAYMENT BY ID
// =========================================================

async function getPaymentById(
  userId,
  paymentId
) {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.order_id,
        p.razorpay_order_id,
        p.razorpay_payment_id,
        p.amount,
        p.currency,
        p.status,
        p.payment_method,
        p.failure_reason,
        p.paid_at,
        p.created_at,
        p.updated_at

      FROM payments p

      INNER JOIN orders o
        ON p.order_id = o.id

      WHERE p.id = $1
        AND o.user_id = $2
    `,
    [
      paymentId,
      userId,
    ]
  );

  return result.rows[0] || null;
}

// =========================================================
// GET PAYMENTS FOR ORDER
// =========================================================

async function getPaymentsByOrderId(
  userId,
  orderId
) {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.order_id,
        p.razorpay_order_id,
        p.razorpay_payment_id,
        p.amount,
        p.currency,
        p.status,
        p.payment_method,
        p.failure_reason,
        p.paid_at,
        p.created_at,
        p.updated_at

      FROM payments p

      INNER JOIN orders o
        ON p.order_id = o.id

      WHERE p.order_id = $1
        AND o.user_id = $2

      ORDER BY p.created_at DESC
    `,
    [
      orderId,
      userId,
    ]
  );

  return result.rows;
}

// =========================================================
// MARK PAYMENT AS PAID
// =========================================================

async function markPaymentAsPaid({
  userId,
  paymentId,
  gatewayPaymentId,
  gatewaySignature,
  paymentMethod,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // -----------------------------------------------------
    // 1. Lock payment + order
    // -----------------------------------------------------

    const paymentResult = await client.query(
      `
        SELECT
          p.id,
          p.order_id,
          p.status,
          p.amount,

          o.payment_status,
          o.status AS order_status,
          o.stock_reserved_until

        FROM payments p

        INNER JOIN orders o
          ON p.order_id = o.id

        WHERE p.id = $1
          AND o.user_id = $2

        FOR UPDATE
      `,
      [
        paymentId,
        userId,
      ]
    );

    const payment = paymentResult.rows[0];

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    // -----------------------------------------------------
    // 2. Idempotency
    // -----------------------------------------------------

    if (payment.status === "paid") {
      await client.query("COMMIT");
      return payment;
    }

    // -----------------------------------------------------
    // 3. Prevent payment after order already paid
    // -----------------------------------------------------

    if (payment.payment_status === "paid") {
      throw new Error("ORDER_ALREADY_PAID");
    }

    // -----------------------------------------------------
    // 4. Check reservation
    // -----------------------------------------------------

    if (!payment.stock_reserved_until) {
      throw new Error("STOCK_RESERVATION_NOT_ACTIVE");
    }

    if (
      new Date(payment.stock_reserved_until) <= new Date()
    ) {
      throw new Error("STOCK_RESERVATION_EXPIRED");
    }

    // -----------------------------------------------------
    // 5. Check another successful payment
    // -----------------------------------------------------

    const successfulPaymentResult = await client.query(
      `
        SELECT
          id
        FROM payments
        WHERE order_id = $1
          AND status = 'paid'
          AND id <> $2
        LIMIT 1
      `,
      [
        payment.order_id,
        paymentId,
      ]
    );

    if (successfulPaymentResult.rows.length > 0) {
      throw new Error("ORDER_ALREADY_PAID");
    }

    // -----------------------------------------------------
    // 6. Update payment
    // -----------------------------------------------------

    const updateResult = await client.query(
      `
        UPDATE payments

        SET
          razorpay_payment_id = $1,
          razorpay_signature = $2,
          payment_method = $3,
          status = 'paid',
          paid_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $4

        RETURNING
          id,
          order_id,
          amount,
          currency,
          status,
          razorpay_payment_id,
          paid_at
      `,
      [
        gatewayPaymentId,
        gatewaySignature,
        paymentMethod || null,
        paymentId,
      ]
    );

    // -----------------------------------------------------
    // 7. Confirm order
    // -----------------------------------------------------

    await client.query(
      `
        UPDATE orders

        SET
          payment_status = 'paid',
          status = 'confirmed',
          stock_reserved_until = NULL,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $1
      `,
      [payment.order_id]
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

// =========================================================
// MARK PAYMENT AS FAILED
// =========================================================

async function markPaymentAsFailed(
  userId,
  paymentId,
  failureReason
) {
  const result = await pool.query(
    `
      UPDATE payments p

      SET
        status = 'failed',
        failure_reason = $1,
        updated_at = CURRENT_TIMESTAMP

      FROM orders o

      WHERE p.id = $2
        AND p.order_id = o.id
        AND o.user_id = $3
        AND p.status <> 'paid'

      RETURNING
        p.id,
        p.order_id,
        p.status,
        p.failure_reason,
        p.updated_at
    `,
    [
      failureReason || null,
      paymentId,
      userId,
    ]
  );

  return result.rows[0] || null;
}

// =========================================================
// SIMULATE SUCCESSFUL PAYMENT
// =========================================================

async function simulatePaymentSuccess(
  userId,
  paymentId
) {
  const payment =
    await getPaymentById(
      userId,
      paymentId
    );

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (payment.status === "paid") {
    throw new Error("ORDER_ALREADY_PAID");
  }

  const gatewayPayment =
    await simulateSuccessfulPayment({
      gatewayOrderId:
        payment.razorpay_order_id,
    });

  return markPaymentAsPaid({
    userId,
    paymentId,

    gatewayPaymentId:
      gatewayPayment.gatewayPaymentId,

    gatewaySignature:
      gatewayPayment.signature,

    paymentMethod:
      gatewayPayment.paymentMethod,
  });
}

// =========================================================
// SIMULATE FAILED PAYMENT
// =========================================================

async function simulatePaymentFailure(
  userId,
  paymentId,
  reason
) {
  const payment =
    await getPaymentById(
      userId,
      paymentId
    );

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (payment.status === "paid") {
    throw new Error("ORDER_ALREADY_PAID");
  }

  const gatewayPayment =
    await simulateFailedPayment({
      gatewayOrderId:
        payment.razorpay_order_id,
      reason,
    });

  return markPaymentAsFailed(
    userId,
    paymentId,
    gatewayPayment.failureReason
  );
}

// =========================================================
// PROCESS MOCK WEBHOOK
// =========================================================

async function processMockWebhook({
  gatewayOrderId,
  gatewayPaymentId,
  status,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // -----------------------------------------------------
    // 1. Find payment using gateway order ID
    // -----------------------------------------------------

    const paymentResult = await client.query(
      `
        SELECT
          p.id,
          p.order_id,
          p.status,
          p.amount,

          o.payment_status,
          o.status AS order_status

        FROM payments p

        INNER JOIN orders o
          ON p.order_id = o.id

        WHERE p.razorpay_order_id = $1

        FOR UPDATE
      `,
      [gatewayOrderId]
    );

    const payment = paymentResult.rows[0];

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    // -----------------------------------------------------
    // 2. Idempotency
    // -----------------------------------------------------

    if (payment.status === "paid") {
      await client.query("COMMIT");

      return {
        alreadyProcessed: true,
        paymentId: payment.id,
        orderId: payment.order_id,
        status: "paid",
      };
    }

    // -----------------------------------------------------
    // 3. Handle successful webhook
    // -----------------------------------------------------

    if (status === "paid") {

      // Check if another payment already succeeded
      const successfulPaymentResult =
        await client.query(
          `
            SELECT id
            FROM payments
            WHERE order_id = $1
              AND status = 'paid'
              AND id <> $2
            LIMIT 1
          `,
          [
            payment.order_id,
            payment.id,
          ]
        );

      if (
        successfulPaymentResult.rows.length > 0
      ) {
        await client.query("COMMIT");

        return {
          alreadyProcessed: true,
          paymentId: payment.id,
          orderId: payment.order_id,
          status: "paid",
        };
      }

      // Update payment
      await client.query(
        `
          UPDATE payments

          SET
            razorpay_payment_id = $1,
            status = 'paid',
            paid_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $2
        `,
        [
          gatewayPaymentId,
          payment.id,
        ]
      );

      // Confirm order
      await client.query(
        `
          UPDATE orders

          SET
            payment_status = 'paid',
            status = 'confirmed',
            stock_reserved_until = NULL,
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $1
        `,
        [payment.order_id]
      );

      await client.query("COMMIT");

      return {
        alreadyProcessed: false,
        paymentId: payment.id,
        orderId: payment.order_id,
        status: "paid",
      };
    }

    // -----------------------------------------------------
    // 4. Handle failed webhook
    // -----------------------------------------------------

    if (status === "failed") {

      await client.query(
        `
          UPDATE payments

          SET
            status = 'failed',
            updated_at = CURRENT_TIMESTAMP

          WHERE id = $1
            AND status <> 'paid'
        `,
        [payment.id]
      );

      // IMPORTANT:
      // We do NOT release stock here.
      // User can retry payment while reservation is active.

      await client.query("COMMIT");

      return {
        alreadyProcessed: false,
        paymentId: payment.id,
        orderId: payment.order_id,
        status: "failed",
      };
    }

    // -----------------------------------------------------
    // 5. Unsupported webhook status
    // -----------------------------------------------------

    throw new Error("UNSUPPORTED_WEBHOOK_STATUS");

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
}

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createPaymentAttempt,
  getPaymentById,
  getPaymentsByOrderId,
  markPaymentAsPaid,
  markPaymentAsFailed,
  simulatePaymentSuccess,
  simulatePaymentFailure,
  processMockWebhook,
};