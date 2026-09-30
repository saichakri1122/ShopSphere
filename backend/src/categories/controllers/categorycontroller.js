const {
  getAllCategories,
  getCategoryById,
  createCategory,
} = require("../services/categoryservices");

const {
  validateCreateCategoryInput,
} = require("../validations/categoryvalidation");

async function getCategories(req, res) {
  try {
    const categories = await getAllCategories();

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
}

async function getCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
}

async function createCategoryController(req, res) {
  try {
    const validationError = validateCreateCategoryInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const category = await createCategory(req.body);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
}

module.exports = {
  getCategories,
  getCategory,
  createCategoryController,
};