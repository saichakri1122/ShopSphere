const express = require("express");

const {
  getOrders,
  getOrder,
  createNewOrder,
  cancelExistingOrder,
} = require("../controllers/ordercontroller");

const authMiddleware = require("../../middleware/authmiddleware");

const router = express.Router();


// Get all orders
router.get(
  "/",
  authMiddleware,
  getOrders
);


// Get one order
router.get(
  "/:id",
  authMiddleware,
  getOrder
);


// Create order
router.post(
  "/",
  authMiddleware,
  createNewOrder
);


// Cancel order
router.patch(
  "/:id/cancel",
  authMiddleware,
  cancelExistingOrder
);


module.exports = router;