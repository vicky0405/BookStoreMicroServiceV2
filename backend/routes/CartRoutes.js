const express = require("express");
const router = express.Router();
const CartController = require("../controllers/CartController");

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

router.use(verifyToken);
router.get("/", CartController.getCart);
router.post("/", CartController.addToCart);
router.put("/quantity", CartController.updateQuantity);
// delete specific book from cart by bookID
router.delete("/:bookID", CartController.removeFromCart);
// clear entire cart for current user
router.delete("/", CartController.clearCart);
module.exports = router;
