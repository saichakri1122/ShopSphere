const {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../services/cartservices");

const {
  validateAddToCartInput,
  validateUpdateCartItemInput,
} = require("../validations/cartvalidation");


// Get user's cart
async function getCart(req, res) {
  try {
    const userId = req.user.id;

    const items = await getCartByUserId(userId);

    return res.status(200).json({
      success: true,
      cart: {
        items,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
}


// Add product to cart
async function addProductToCart(req, res) {
  try {
    const validationError = validateAddToCartInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.user.id;

    const { productId, quantity } = req.body;

    const cartItem = await addToCart(
      userId,
      productId,
      Number(quantity)
    );

    return res.status(201).json({
      success: true,
      message: "Product added to cart",
      cartItem,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
}


// Update cart item quantity
async function updateCartItemQuantity(req, res) {
  try {
    const validationError = validateUpdateCartItemInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.user.id;

    const { id: cartItemId } = req.params;
    const { quantity } = req.body;

    const cartItem = await updateCartItem(
      userId,
      cartItemId,
      Number(quantity)
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Update cart item error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
}


// Remove product from cart
async function removeProductFromCart(req, res) {
  try {
    const userId = req.user.id;

    const { id: cartItemId } = req.params;

    const removedItem = await removeFromCart(
      userId,
      cartItemId
    );

    if (!removedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error("Remove from cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
}


// Clear cart
async function clearUserCart(req, res) {
  try {
    const userId = req.user.id;

    const deletedCount = await clearCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      deletedItems: deletedCount,
    });
  } catch (error) {
    console.error("Clear cart error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
}


module.exports = {
  getCart,
  addProductToCart,
  updateCartItemQuantity,
  removeProductFromCart,
  clearUserCart,
};