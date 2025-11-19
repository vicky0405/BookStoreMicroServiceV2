const express = require("express");
const router = express.Router();
const axios = require("axios");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");
  try {
    const response = await axios.get(
      USER_SERVICE_URL + "/api/auth/validate-token",
      {
        headers: { Authorization: token },
      }
    );
    req.user = response.data.user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
const OrderController = require("../controllers/OrderController");

router.get(
  "/processing",
  verifyToken,
  OrderController.getOrdersByStatusAndUser
);
router.get("/confirmed", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/delivered", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get(
  "/delivering",
  verifyToken,
  OrderController.getOrdersByStatusAndUser
);
router.get("/cancelled", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get(
  "/delivering/shipper",
  verifyToken,
  OrderController.getOrdersByShipperID
);
router.get(
  "/delivered/shipper",
  verifyToken,
  OrderController.getOrdersByShipperID
);
router.get(
  "/processing/all",
  verifyToken,
  OrderController.getAllOrdersByStatus
);
router.get("/confirmed/all", verifyToken, OrderController.getAllOrdersByStatus);
router.get(
  "/delivering/all",
  verifyToken,
  OrderController.getAllOrdersByStatus
);
router.get("/delivered/all", verifyToken, OrderController.getAllOrdersByStatus);
router.get("/", verifyToken, OrderController.getOrdersByUserID);
router.post("/", verifyToken, OrderController.createOrder);
router.patch("/:orderId/confirm", verifyToken, OrderController.confirmOrder);
router.patch("/:orderId/complete", verifyToken, OrderController.completeOrder);
router.patch("/:orderId/cancel", verifyToken, OrderController.cancelOrder);
router.post(
  "/:orderId/assign-shipper",
  verifyToken,
  OrderController.assignOrderToShipper
);

module.exports = router;
