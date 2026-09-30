// =========================================================
// MOCK PAYMENT GATEWAY
// =========================================================
// This simulates an external payment provider such as
// Razorpay/Stripe for local development and testing.
// =========================================================


// Create a mock payment order
async function createPaymentOrder({
  orderId,
  amount,
  currency = "INR",
}) {
  return {
    gatewayOrderId: `mock_order_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}`,

    orderId,

    amount,

    currency,

    status: "created",
  };
}


// Simulate successful payment
async function simulateSuccessfulPayment({
  gatewayOrderId,
}) {
  return {
    gatewayOrderId,

    gatewayPaymentId: `mock_payment_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}`,

    status: "paid",

    paymentMethod: "mock_card",

    signature: `mock_signature_${Date.now()}`,
  };
}


// Simulate failed payment
async function simulateFailedPayment({
  gatewayOrderId,
  reason = "Payment failed",
}) {
  return {
    gatewayOrderId,

    gatewayPaymentId: `mock_payment_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}`,

    status: "failed",

    paymentMethod: "mock_card",

    failureReason: reason,
  };
}


// Simulate webhook event
async function simulateWebhook({
  gatewayOrderId,
  gatewayPaymentId,
  status,
}) {
  return {
    event: "payment.updated",

    gatewayOrderId,

    gatewayPaymentId,

    status,

    timestamp: new Date().toISOString(),
  };
}


module.exports = {
  createPaymentOrder,
  simulateSuccessfulPayment,
  simulateFailedPayment,
  simulateWebhook,
};