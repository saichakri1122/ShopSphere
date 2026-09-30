const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authroutes");
const productRoutes = require("./products/routes/productroutes");
const categoryRoutes = require("./categories/routes/categoryroutes");
const productImageRoutes = require("./products/routes/productimageroutes");
const cartRoutes = require("./cart/routes/cartroutes");
const wishlistRoutes = require("./wishlist/routes/wishlistroutes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", productImageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/wishlist", wishlistRoutes);


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ShopSphere API is running",
  });
});

module.exports = app;