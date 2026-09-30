const express = require("express");

const {
  getCart,
  addProductToCart,
  updateCartItemQuantity,
  removeProductFromCart,
  clearUserCart,
} = require("../controllers/cartcontroller");

const authMiddleware = require("../../middleware/authmiddleware");

const router = express.Router();


// Get current user's cart
router.get("/", authMiddleware, getCart);


// Add product to cart
router.post("/", authMiddleware, addProductToCart);


// Update cart item quantity
router.patch(
  "/items/:id",
  authMiddleware,
  updateCartItemQuantity
);


// Remove cart item
router.delete(
  "/items/:id",
  authMiddleware,
  removeProductFromCart
);


// Clear entire cart
router.delete(
  "/",
  authMiddleware,
  clearUserCart
);


module.exports = router;