function validateAddToCartInput(data) {
  const { productId, quantity } = data;

  if (!productId || !productId.trim()) {
    return "Product ID is required";
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
