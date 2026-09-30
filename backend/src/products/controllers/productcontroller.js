const {
  getAllProducts,
  getProductById,
  createProduct,
} = require("../services/productservices");

const {
  validateCreateProductInput,
} = require("../validations/productvalidation");

async function getProducts(req, res) {
  try {
    const products = await getAllProducts();

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

async function getProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}

async function createProductController(req, res) {
  try {
    const validationError = validateCreateProductInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const product = await createProduct(req.body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProductController,
};