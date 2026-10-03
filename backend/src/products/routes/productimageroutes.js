const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authmiddleware");
const adminMiddleware = require("../../middleware/adminmiddleware");
const upload = require("../../middleware/uploadmiddleware");

const {
  addImage,
  getImages,
} = require("../controllers/productimagecontroller");

// Upload product image
router.post(
  "/:id/images",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  addImage
);

// Get product images
router.get(
  "/:id/images",
  authMiddleware,
  adminMiddleware,
  getImages
);

module.exports = router;