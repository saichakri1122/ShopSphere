const productDeleteService = require("../services/adminproductdeleteservice");

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await productDeleteService.deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error("Delete product error:", error);

    if (error.code === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
}

module.exports = {
  deleteProduct,
};