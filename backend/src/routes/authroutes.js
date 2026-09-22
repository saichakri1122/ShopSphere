const express = require("express");
const { register,login,getCurrentUser,logout } = require("../controllers/authcontroller");

const authenticateUser = require("../middleware/authmiddleware");
const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateUser, getCurrentUser);
router.post("/logout", logout);

module.exports = router;