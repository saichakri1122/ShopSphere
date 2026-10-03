const productUpdateService = require("../services/adminproductupdateservice");

const {
  validateUpdateProductInput,
} = require("../validations/adminproductupdatevalidation");

async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    const validationError = validateUpdateProductInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const product = await productUpdateService.updateProduct(
      id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (error.code === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (error.code === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (error.code === "DUPLICATE_SLUG") {
      return res.status(409).json({
        success: false,
        message: "Product slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
}

module.exports = {
  updateProduct,
};