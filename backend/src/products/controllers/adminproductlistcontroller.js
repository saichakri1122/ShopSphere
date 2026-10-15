const productListService = require("../services/adminproductlistservices");

async function getAllProducts(req, res) {
  try {
    const products = await productListService.getAllProducts();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get admin products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

async function getActiveProductCount(req, res) {
  try {
    const totalProducts =
      await productListService.getActiveProductCount();

    return res.status(200).json({
      success: true,
      totalProducts,
    });
  } catch (error) {
    console.error("Get active product count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product count",
    });
  }
}

module.exports = {
  getAllProducts,
  getActiveProductCount,
};