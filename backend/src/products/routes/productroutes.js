const express = require("express");

const {
  getProducts,
  getProduct,
  createProductController,
} = require("../controllers/productcontroller");

const router = express.Router();

// GET /api/products
router.get("/", getProducts);

// GET /api/products/:id
router.get("/:id", getProduct);

// POST /api/products
router.post("/", createProductController);

module.exports = router;
