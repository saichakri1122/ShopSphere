const productDetailService = require("../services/adminproductdetailservice");

async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await productDetailService.getProductById(id);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get admin product error:", error);

    if (error.code === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}

module.exports = {
  getProductById,
};