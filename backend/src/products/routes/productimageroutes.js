const express = require("express");

const {
  addImage,
  getImages,
} = require("../controllers/productimagecontroller");

const router = express.Router();

router.get("/:id/images", getImages);
router.post("/:id/images", addImage);

module.exports = router;