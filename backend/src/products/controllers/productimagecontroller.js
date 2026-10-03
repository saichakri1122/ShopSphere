const {
  addProductImage,
  getProductImages,
} = require("../services/productimageservices");

const {
  uploadProductImage,
} = require("../services/cloudinaryimageservice");

const {
  validateAddProductImageInput,
} = require("../validations/productimagevalidation");

async function addImage(req, res) {
  try {
    const { id: productId } = req.params;

    // Make sure an image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadProductImage(
      req.file.buffer,
      req.file.originalname
    );

    // Validate product image data
    const validationError = validateAddProductImageInput({
      productId,
      imageUrl: uploadResult.imageUrl,
      altText: req.body.altText,
      displayOrder: req.body.displayOrder,
      isPrimary: req.body.isPrimary,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Save Cloudinary URL in PostgreSQL
    const image = await addProductImage({
      productId,
      imageUrl: uploadResult.imageUrl,
      altText: req.body.altText,
      displayOrder: req.body.displayOrder,
      isPrimary: req.body.isPrimary,
    });

    return res.status(201).json({
      success: true,
      message: "Product image uploaded successfully",
      image,
      storage: {
        provider: "cloudinary",
        publicId: uploadResult.publicId,
      },
    });
  } catch (error) {
    console.error("Add product image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload product image",
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
    console.error("Get product images error:", error);

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