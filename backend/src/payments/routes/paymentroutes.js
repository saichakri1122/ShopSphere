const express = require("express");

const {
  getPayment,
  getOrderPayments,
  createNewPayment,
  simulateSuccessfulPaymentController,
  simulateFailedPaymentController,
  mockPaymentWebhook,
} = require("../controllers/paymentcontroller");

const authMiddleware = require("../../middleware/authmiddleware");

const router = express.Router();


// Get one payment
router.get(
  "/:id",
  authMiddleware,
  getPayment
);


// Get all payment attempts for an order
router.get(
  "/order/:orderId",
  authMiddleware,
  getOrderPayments
);


// Create payment
router.post(
  "/",
  authMiddleware,
  createNewPayment
);


// Simulate successful payment
router.post(
  "/:id/simulate-success",
  authMiddleware,
  simulateSuccessfulPaymentController
);


// Simulate failed payment
router.post(
  "/:id/simulate-failure",
  authMiddleware,
  simulateFailedPaymentController
);

router.post(
  "/webhook/mock",
  mockPaymentWebhook
);

module.exports = router;