function validateCreateProductInput(data) {
  const {
    name,
    categoryId,
    price,
    stockQuantity,
  } = data;

  if (!name || !name.trim()) {
    return "Product name is required";
  }

  if (!categoryId || !categoryId.trim()) {
    return "Category is required";
  }

  if (price === undefined || price === null || price === "") {
    return "Product price is required";
  }

  if (Number(price) < 0) {
    return "Product price cannot be negative";
  }

  if (
    stockQuantity === undefined ||
    stockQuantity === null ||
    stockQuantity === ""
  ) {
    return "Stock quantity is required";
  }

  if (!Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) < 0) {
    return "Stock quantity must be a non-negative integer";
  }

  return null;
}

function validateUpdateProductInput(data) {
  const {
    name,
    categoryId,
    price,
    stockQuantity,
  } = data;

  if (name !== undefined && !name.trim()) {
    return "Product name cannot be empty";
  }

  if (categoryId !== undefined && !categoryId.trim()) {
    return "Category cannot be empty";
  }

  if (
    price !== undefined &&
    (price === "" || Number(price) < 0)
  ) {
    return "Product price must be a valid non-negative number";
  }

  if (
    stockQuantity !== undefined &&
    (
      stockQuantity === "" ||
      !Number.isInteger(Number(stockQuantity)) ||
      Number(stockQuantity) < 0
    )
  ) {
    return "Stock quantity must be a non-negative integer";
  }

  return null;
}

module.exports = {
  validateCreateProductInput,
  validateUpdateProductInput,
};