
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function generateAIResponse(message) {
  const response = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    messages: [
      {
        role: "system",
        content:
          "You are ShopSphere AI, a helpful shopping assistant. Help customers with products, shopping, carts, orders, and general questions. Be friendly and concise. Never invent product prices, stock availability, or order information. If you do not have access to information, say so.",
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return (
    response.choices?.[0]?.message?.content ||
    "Sorry, I couldn't generate a response. Please try again."
  );
}

module.exports = { generateAIResponse };
