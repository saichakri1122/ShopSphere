const express = require("express");

const {
  getCategories,
  getCategory,
  createCategoryController,
} = require("../controllers/categorycontroller");

const router = express.Router();

// GET /api/categories
router.get("/", getCategories);

// GET /api/categories/:id
router.get("/:id", getCategory);

// POST /api/categories
router.post("/", createCategoryController);

module.exports = router;