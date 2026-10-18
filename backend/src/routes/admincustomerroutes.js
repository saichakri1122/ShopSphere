const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminmiddleware");

const {
  getCustomerCount,
} = require("../controllers/admincustomercontroller");

router.get(
  "/count",
  authMiddleware,
  adminMiddleware,
  getCustomerCount
);

module.exports = router;