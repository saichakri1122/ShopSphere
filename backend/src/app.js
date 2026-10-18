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
const addressRoutes = require("./addresses/routes/addressroutes");
const orderRoutes = require("./orders/routes/orderroutes");
const paymentRoutes = require("./payments/routes/paymentroutes");
const adminProductRoutes = require("./products/routes/adminproductroutes");
const aiRoutes = require("./routes/airoutes");

const app = express();

app.use(helmet());


const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header (e.g., server-to-server).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/customers", require("./routes/admincustomerroutes"));
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ShopSphere API is running",
  });
});

module.exports = app;