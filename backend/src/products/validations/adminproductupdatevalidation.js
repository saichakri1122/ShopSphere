function validateUpdateProductInput(data) {
  const {
    name,
    slug,
    category_id,
    price,
    compare_at_price,
    stock_quantity,
    brand,
    is_featured,
    is_new_arrival,
    is_essential,
    is_active,
  } = data;

  if (name !== undefined && (!name || !name.trim())) {
    return "Product name cannot be empty";
  }

  if (slug !== undefined && (!slug || !slug.trim())) {
    return "Product slug cannot be empty";
  }

  if (category_id !== undefined && (!category_id || !category_id.trim())) {
    return "Category cannot be empty";
  }

  if (price !== undefined && (price === "" || Number(price) < 0)) {
    return "Price cannot be negative";
  }

  if (
    compare_at_price !== undefined &&
    compare_at_price !== null &&
    compare_at_price !== "" &&
    Number(compare_at_price) < 0
  ) {
    return "Compare-at price cannot be negative";
  }

  if (
    stock_quantity !== undefined &&
    (!Number.isInteger(Number(stock_quantity)) ||
      Number(stock_quantity) < 0)
  ) {
    return "Stock quantity must be a non-negative integer";
  }

  if (is_featured !== undefined && typeof is_featured !== "boolean") {
    return "is_featured must be a boolean";
  }

  if (is_new_arrival !== undefined && typeof is_new_arrival !== "boolean") {
    return "is_new_arrival must be a boolean";
  }

  if (is_essential !== undefined && typeof is_essential !== "boolean") {
    return "is_essential must be a boolean";
  }

  if (is_active !== undefined && typeof is_active !== "boolean") {
    return "is_active must be a boolean";
  }

  return null;
}

module.exports = {
  validateUpdateProductInput,
};