const {
  addProductImage,
  getProductImages,
} = require("../services/productimageservices");

const {
  validateAddProductImageInput,
} = require("../validations/productimagevalidation");

async function addImage(req, res) {
  try {
    const { id: productId } = req.params;

    const validationError = validateAddProductImageInput({
      ...req.body,
      productId,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const image = await addProductImage({
      productId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Product image added successfully",
      image,
    });
  } catch (error) {
    console.error("Add product image error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add product image",
    });
  }
}

async function getImages(req, res) {
  try {
    const { id: productId } = req.params;

    const images = await getProductImages(productId);

    return res.status(200).json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Get product images error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product images",
    });
  }
}

module.exports = {
  addImage,
  getImages,
};