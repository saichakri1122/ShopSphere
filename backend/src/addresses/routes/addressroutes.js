const express = require("express");

const {
  getAddresses,
  getAddress,
  createNewAddress,
  updateExistingAddress,
  removeAddress,
  makeDefaultAddress,
} = require("../controllers/addresscontroller");

const authMiddleware = require("../../middleware/authmiddleware");

const router = express.Router();


// Get all addresses
router.get("/", authMiddleware, getAddresses);


// Get one address
router.get("/:id", authMiddleware, getAddress);


// Create address
router.post("/", authMiddleware, createNewAddress);


// Update address
router.patch("/:id", authMiddleware, updateExistingAddress);


// Delete address
router.delete("/:id", authMiddleware, removeAddress);


// Set default address
router.patch(
  "/:id/default",
  authMiddleware,
  makeDefaultAddress
);


module.exports = router;