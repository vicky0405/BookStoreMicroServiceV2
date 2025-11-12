import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
const app = express();
app.use(cors());
import dotenv from "dotenv";
dotenv.config();

const MONOLITH_URL = process.env.MONOLITH_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
const PORT = process.env.PORT;
//User Service
app.use(
  "/api/auth/login",

  createProxyMiddleware({
    target: USER_SERVICE_URL + "/api/auth/login",
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.use(
  "/api/auth/validate-token",

  createProxyMiddleware({
    target: USER_SERVICE_URL + "/api/auth/validate-token",
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.use(
  "/api/users/register",
  createProxyMiddleware({
    target: USER_SERVICE_URL + "/api/users",
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.use(
  "/api/users/",
  createProxyMiddleware({
    target: USER_SERVICE_URL + "/api/users",
    changeOrigin: true,
    logLevel: "debug",
  })
);

// Order Service
app.use(
  "/api/orders",
  createProxyMiddleware({
    target: ORDER_SERVICE_URL + "/api/orders",
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.use(
  "/api/shipping-methods",
  createProxyMiddleware({
    target: ORDER_SERVICE_URL + "/api/shipping-methods",
    changeOrigin: true,
    logLevel: "debug",
  })
);

// Còn lại → Monolith/legacy code
app.use(
  "/api/payment",

  createProxyMiddleware({
    target: MONOLITH_URL + "/api/payment",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/categories",

  createProxyMiddleware({
    target: MONOLITH_URL + "/api/categories",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/publishers",

  createProxyMiddleware({
    target: MONOLITH_URL + "/api/publishers",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/suppliers",

  createProxyMiddleware({
    target: MONOLITH_URL + "/api/suppliers",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/books",
  createProxyMiddleware({
    target: MONOLITH_URL + "/api/books",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/damage-reports",
  createProxyMiddleware({
    target: MONOLITH_URL + "/api/damage-reports",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/rules",
  createProxyMiddleware({
    target: MONOLITH_URL + "/api/rules",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/promotions",

  createProxyMiddleware({
    target: MONOLITH_URL + "/api/promotions",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/imports",

  createProxyMiddleware({
    target: MONOLITH_URL + "/api/imports",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/cart",
  createProxyMiddleware({
    target: MONOLITH_URL + "/api/cart",
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.use(
  "/api/addresses",
  createProxyMiddleware({
    target: MONOLITH_URL + "/api/addresses",
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.use(
  "/api/ratings",
  createProxyMiddleware({
    target: MONOLITH_URL + "/api/ratings",
    changeOrigin: true,
    logLevel: "debug",
  })
);
app.use(
  "/api/reports",

  createProxyMiddleware({
    target: MONOLITH_URL + "/api/reports",
    changeOrigin: true,
    logLevel: "debug",
  })
);

app.listen(PORT, () => console.log("✅ Gateway running on port " + PORT));
