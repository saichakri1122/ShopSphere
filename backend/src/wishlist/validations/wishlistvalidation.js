function validateAddToWishlistInput(data) {
  const { productId } = data;

  if (!productId || !productId.trim()) {
    return "Product ID is required";
  }

  return null;
}

module.exports = {
  validateAddToWishlistInput,
};