require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { checkAndDecreaseStock } = require("./services/BookService");
if (process.env.NODE_ENV === "production") {
  // Azure deploy
  const AzureAdapter = require("./messaging/azureAdapter");
  messageBus = new AzureAdapter(process.env.AZURE_CONNECTION_STRING);
} else {
  // Local dev
  messageBus = require("./messaging/localAdapter");
}

// =============================
// ⚙️ Cấu hình kết nối Azure MySQL
// =============================
const { DB_DIALECT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } =
  process.env;

process.env.DATABASE_URL = `mysql://${DB_USER}:${encodeURIComponent(
  DB_PASSWORD
)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?ssl=true`;

// =============================
// Initialize all models
// =============================
require("./models");

// const authRoutes = require("./routes/AuthRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");
const DamageReportRoutes = require("./routes/DamageReportRoutes");
const publisherRoutes = require("./routes/PublisherRoutes");
const supplierRoutes = require("./routes/SupplierRoutes");
const bookRoutes = require("./routes/BookRoutes");
// const userRoutes = require("./routes/UserRoutes");
const rule = require("./routes/RuleRoutes");
const promotionRoutes = require("./routes/PromotionRoutes");
const importRoutes = require("./routes/ImportRoutes");
const cartRoutes = require("./routes/CartRoutes");
const addressRoutes = require("./routes/AddressRoutes");
const ratingRoutes = require("./routes/RatingRoutes");
const reportRoutes = require("./routes/ReportRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");

const app = express();
const PORT = process.env.PORT;

const allowedOrigins = [
  "https://polite-plant-0a1f5f900.3.azurestaticapps.net",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

// Test route
app.get("/api-test", (req, res) => {
  res.json({ message: "API is working", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.send("API is running");
});

// Routes
app.use("/api/payment", paymentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/damage-reports", DamageReportRoutes);
app.use("/api/rules", rule);
app.use("/api/promotions", promotionRoutes);
app.use("/api/imports", importRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reports", reportRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.path });
});

messageBus.consume("order.created", async (msg) => {
  try {
    await checkAndDecreaseStock(msg.orderDetails);
    await messageBus.publish("order.stock.success", { orderId: msg.orderId });
  } catch (err) {
    console.error("Trừ tồn kho thất bại:", err.message);
    await messageBus.publish("order.stock.failed", {
      orderId: msg.orderId,
      reason: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
