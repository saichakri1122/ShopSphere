const express = require("express");

const {
  getWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  clearUserWishlist,
} = require("../controllers/wishlistcontroller");

const authMiddleware = require("../../middleware/authmiddleware");

const router = express.Router();


// Get current user's wishlist
router.get("/", authMiddleware, getWishlist);


// Add product to wishlist
router.post("/", authMiddleware, addProductToWishlist);


// Remove wishlist item
router.delete(
  "/items/:id",
  authMiddleware,
  removeProductFromWishlist
);


// Clear entire wishlist
router.delete(
  "/",
  authMiddleware,
  clearUserWishlist
);


module.exports = router;