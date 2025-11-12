const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const orderRoutes = require("./routes/OrderRoutes"); // nếu bạn gộp AuthRoutes + UserRoutes vào user-service
const shippingMethodRoutes = require("./routes/ShippingMethodRoutes");
const app = express();
app.use(cors());
app.use(bodyParser.json());
require("dotenv").config();
const { Order } = require("./models");
const PORT = process.env.PORT;

if (process.env.NODE_ENV === "production") {
  // Azure deploy
  const AzureAdapter = require("./messaging/azureAdapter");
  messageBus = new AzureAdapter(process.env.AZURE_CONNECTION_STRING);
} else {
  // Local dev
  messageBus = require("./messaging/localAdapter");
}

// Mount order
app.use("/api/orders", orderRoutes);
app.use("/api/shipping-methods", shippingMethodRoutes);

// optional: health + verify token endpoint
app.get("/health", (req, res) => res.json({ ok: true }));

messageBus.consume("order.stock.success", async ({ orderId }) => {
  await Order.update({ status: "confirmed" }, { where: { id: orderId } });
});

messageBus.consume("order.stock.failed", async ({ orderId, reason }) => {
  await Order.update(
    { status: "stock_failed", fail_reason: reason },
    { where: { id: orderId } }
  );
});
app.listen(PORT, () => console.log(`Order service running on ` + PORT));
