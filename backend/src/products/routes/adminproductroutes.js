const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authmiddleware");
const adminMiddleware = require("../../middleware/adminmiddleware");

const {
  createProduct,
} = require("../controllers/adminproductcontroller");

const {
  getAllProducts,
} = require("../controllers/adminproductlistcontroller");

const {
  getProductById,
} = require("../controllers/adminproductdetailcontroller");

const {
  updateProduct,
} = require("../controllers/adminproductupdatecontroller");

const {
  deleteProduct,
} = require("../controllers/adminproductdeletecontroller");

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAllProducts
);

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  getProductById
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProduct
);

router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);


module.exports = router;