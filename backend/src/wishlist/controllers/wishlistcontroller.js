const {
  getWishlistByUserId,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../services/wishlistservices");

const {
  validateAddToWishlistInput,
} = require("../validations/wishlistvalidation");


// Get user's wishlist
async function getWishlist(req, res) {
  try {
    const userId = req.user.id;

    const items = await getWishlistByUserId(userId);

    return res.status(200).json({
      success: true,
      wishlist: {
        items,
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
}


// Add product to wishlist
async function addProductToWishlist(req, res) {
  try {
    const validationError = validateAddToWishlistInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.user.id;
    const { productId } = req.body;

    const wishlistItem = await addToWishlist(
      userId,
      productId
    );

    // Product already exists in wishlist
    if (!wishlistItem) {
      return res.status(409).json({
        success: false,
        message: "Product is already in wishlist",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlistItem,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
}


// Remove product from wishlist
async function removeProductFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { id: wishlistItemId } = req.params;

    const removedItem = await removeFromWishlist(
      userId,
      wishlistItemId
    );

    if (!removedItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error(
      "Remove from wishlist error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
}


// Clear wishlist
async function clearUserWishlist(req, res) {
  try {
    const userId = req.user.id;

    const deletedCount = await clearWishlist(userId);

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      deletedItems: deletedCount,
    });
  } catch (error) {
    console.error("Clear wishlist error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
}


module.exports = {
  getWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  clearUserWishlist,
};