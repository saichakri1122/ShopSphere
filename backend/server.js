require("dotenv").config();

const app = require("./src/app");
require("./src/config/database");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ShopSphere backend running on http://localhost:${PORT}`);
});