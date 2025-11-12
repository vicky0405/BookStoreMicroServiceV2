const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const orderRoutes = require("./routes/OrderRoutes"); // nếu bạn gộp AuthRoutes + UserRoutes vào user-service
const shippingMethodRoutes = require("./routes/ShippingMethodRoutes");
const app = express();
app.use(cors());
app.use(bodyParser.json());
require("dotenv").config();

const PORT = process.env.PORT;

// Mount order
app.use("/api/orders", orderRoutes);
app.use("/api/shipping-methods", shippingMethodRoutes);

// optional: health + verify token endpoint
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Order service running on ` + PORT));
