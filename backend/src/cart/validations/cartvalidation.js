function validateAddToCartInput(data) {
  const { productId, quantity } = data;

  // Product IDs are UUIDs in this project.
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    typeof productId !== "string" ||
    !uuidRegex.test(productId)
  ) {
    return "A valid Product ID is required";
  }

  if (
    quantity === undefined ||
    quantity === null ||
    quantity === ""
  ) {
    return "Quantity is required";
  }

  if (
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) <= 0
  ) {
    return "Quantity must be a positive integer";
  }

  return null;
}

function validateUpdateCartItemInput(data) {
  const { quantity } = data;

  if (
    quantity === undefined ||
    quantity === null ||
    quantity === ""
  ) {
    return "Quantity is required";
  }

  if (
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) <= 0
  ) {
    return "Quantity must be a positive integer";
  }

  return null;
}

module.exports = {
  validateAddToCartInput,
  validateUpdateCartItemInput,
};