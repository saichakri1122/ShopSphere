function validateAddToWishlistInput(data) {
  const { productId } = data;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    typeof productId !== "string" ||
    !uuidRegex.test(productId)
  ) {
    return "A valid Product ID is required";
  }

  return null;
}

module.exports = {
  validateAddToWishlistInput,
};