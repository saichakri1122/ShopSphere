
const express = require("express");
const { chat } = require("../controllers/aicontroller");
const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/chat", authMiddleware, chat);

module.exports = router;
