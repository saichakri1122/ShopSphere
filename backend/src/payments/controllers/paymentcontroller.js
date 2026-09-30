const {
  createPaymentAttempt,
  getPaymentById,
  getPaymentsByOrderId,
  simulatePaymentSuccess,
  simulatePaymentFailure,
  processMockWebhook,
} = require("../services/paymentservices");

const {
  validateCreatePaymentInput,
} = require("../validations/paymentvalidation");


// =========================================================
// GET ONE PAYMENT
// =========================================================

async function getPayment(req, res) {
  try {
    const userId = req.user.id;
    const { id: paymentId } = req.params;

    const payment = await getPaymentById(
      userId,
      paymentId
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });

  } catch (error) {
    console.error(
      "Get payment error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
    });
  }
}


// =========================================================
// GET PAYMENTS FOR ORDER
// =========================================================

async function getOrderPayments(req, res) {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const payments = await getPaymentsByOrderId(
      userId,
      orderId
    );

    return res.status(200).json({
      success: true,
      payments,
    });

  } catch (error) {
    console.error(
      "Get order payments error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order payments",
    });
  }
}


// =========================================================
// CREATE PAYMENT
// =========================================================

async function createNewPayment(req, res) {
  try {
    const validationError =
      validateCreatePaymentInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.user.id;
    const { orderId } = req.body;

    const payment = await createPaymentAttempt(
      userId,
      orderId
    );

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
    });

  } catch (error) {

    console.error(
      "Create payment error:",
      error.message
    );


    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    if (error.message === "ORDER_ALREADY_PAID") {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }


    return res.status(500).json({
      success: false,
      message: "Failed to create payment",
    });
  }
}


// =========================================================
// SIMULATE SUCCESSFUL PAYMENT
// =========================================================

async function simulateSuccessfulPaymentController(
  req,
  res
) {
  try {
    const userId = req.user.id;
    const { id: paymentId } = req.params;

    const payment =
      await simulatePaymentSuccess(
        userId,
        paymentId
      );

    return res.status(200).json({
      success: true,
      message: "Mock payment successful",
      payment,
    });

  } catch (error) {

    console.error(
      "Simulate successful payment error:",
      error.message
    );


    if (
      error.message === "PAYMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }


    if (
      error.message === "ORDER_ALREADY_PAID"
    ) {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }


    return res.status(500).json({
      success: false,
      message: "Failed to process mock payment",
    });
  }
}


// =========================================================
// SIMULATE FAILED PAYMENT
// =========================================================

async function simulateFailedPaymentController(
  req,
  res
) {
  try {
    const userId = req.user.id;
    const { id: paymentId } = req.params;

    const {
      reason,
    } = req.body;

    const payment =
      await simulatePaymentFailure(
        userId,
        paymentId,
        reason
      );

    return res.status(200).json({
      success: true,
      message: "Mock payment failed",
      payment,
    });

  } catch (error) {

    console.error(
      "Simulate failed payment error:",
      error.message
    );


    if (
      error.message === "PAYMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }


    return res.status(500).json({
      success: false,
      message: "Failed to process mock payment",
    });
  }
}

// =========================================================
// MOCK PAYMENT WEBHOOK
// =========================================================

async function mockPaymentWebhook(req, res) {
  try {
    // =====================================================
    // 1. Validate webhook secret
    // =====================================================

    const webhookSecret =
      req.headers["x-mock-webhook-secret"];

    if (
      !webhookSecret ||
      webhookSecret !== process.env.MOCK_WEBHOOK_SECRET
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook secret",
      });
    }

    // =====================================================
    // 2. Read webhook data
    // =====================================================

    const {
      gatewayOrderId,
      gatewayPaymentId,
      status,
    } = req.body;

    // =====================================================
    // 3. Validate gateway order ID
    // =====================================================

    if (!gatewayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Gateway order ID is required",
      });
    }

    // =====================================================
    // 4. Validate webhook status
    // =====================================================

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Webhook status is required",
      });
    }

    // =====================================================
    // 5. Process webhook
    // =====================================================

    const result =
      await processMockWebhook({
        gatewayOrderId,
        gatewayPaymentId,
        status,
      });

    // =====================================================
    // 6. Return result
    // =====================================================

    return res.status(200).json({
      success: true,
      message: result.alreadyProcessed
        ? "Webhook already processed"
        : "Webhook processed successfully",
      result,
    });

  } catch (error) {
    console.error(
      "Mock payment webhook error:",
      error
    );

    // =====================================================
    // PAYMENT NOT FOUND
    // =====================================================

    if (error.message === "PAYMENT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // =====================================================
    // UNSUPPORTED STATUS
    // =====================================================

    if (
      error.message ===
      "UNSUPPORTED_WEBHOOK_STATUS"
    ) {
      return res.status(400).json({
        success: false,
        message: "Unsupported webhook status",
      });
    }

    // =====================================================
    // DEFAULT ERROR
    // =====================================================

    return res.status(500).json({
      success: false,
      message: "Failed to process payment webhook",
    });
  }
}


module.exports = {
  getPayment,
  getOrderPayments,
  createNewPayment,
  simulateSuccessfulPaymentController,
  simulateFailedPaymentController,
  mockPaymentWebhook,
};
