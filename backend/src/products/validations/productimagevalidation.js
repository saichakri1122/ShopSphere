function validateAddProductImageInput(data) {
  const {
    productId,
    imageUrl,
    displayOrder,
  } = data;

  if (!productId || !productId.trim()) {
    return "Product ID is required";
  }

  if (!imageUrl || !imageUrl.trim()) {
    return "Image URL is required";
  }

  try {
    new URL(imageUrl.trim());
  } catch {
    return "Please provide a valid image URL";
  }

  if (
    displayOrder !== undefined &&
    (
      !Number.isInteger(Number(displayOrder)) ||
      Number(displayOrder) < 0
    )
  ) {
    return "Display order must be a non-negative integer";
  }

  return null;
}

module.exports = {
  validateAddProductImageInput,
};