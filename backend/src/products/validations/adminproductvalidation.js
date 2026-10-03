function validateCreateProductInput(data) {
  const {
    name,
    slug,
    category_id,
    price,
    stock_quantity,
  } = data;

  if (!name || !name.trim()) {
    return "Product name is required";
  }

  if (!slug || !slug.trim()) {
    return "Product slug is required";
  }

  if (!category_id || !category_id.trim()) {
    return "Category is required";
  }

  if (price === undefined || price === null || price === "") {
    return "Product price is required";
  }

  if (Number(price) < 0) {
    return "Product price cannot be negative";
  }

  if (
    stock_quantity === undefined ||
    stock_quantity === null ||
    stock_quantity === ""
  ) {
    return "Stock quantity is required";
  }

  if (
    !Number.isInteger(Number(stock_quantity)) ||
    Number(stock_quantity) < 0
  ) {
    return "Stock quantity must be a non-negative integer";
  }

  return null;
}

module.exports = {
  validateCreateProductInput,
};