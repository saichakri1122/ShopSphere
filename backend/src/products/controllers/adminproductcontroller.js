const productService = require("../services/adminproductservices");
const {
  validateCreateProductInput,
} = require("../validations/adminproductvalidation");

async function createProduct(req, res) {
  try {
    const validationError = validateCreateProductInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const product = await productService.createProduct(req.body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

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
      message: "Failed to create product",
    });
  }
}

module.exports = {
  createProduct,
};