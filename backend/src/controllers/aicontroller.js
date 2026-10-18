
const { generateAIResponse } = require("../services/aiservices");

async function chat(req, res) {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message must be 2000 characters or fewer.",
      });
    }

const userId = req.user.id;
const reply = await generateAIResponse(message.trim(), userId);

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("ShopSphere AI error:", error.message);

    return res.status(502).json({
      success: false,
      message: "The AI assistant is temporarily unavailable. Please try again.",
    });
  }
}

module.exports = { chat };
