const cloudinary = require("../../config/cloudinary");

async function uploadProductImage(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "shopsphere/products",
        resource_type: "image",
        public_id: `${Date.now()}-${originalName
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9-_]/g, "-")}`,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          imageUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

module.exports = {
  uploadProductImage,
};