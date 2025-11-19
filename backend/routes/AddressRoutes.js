const express = require("express");
const router = express.Router();
const addressController = require("../controllers/AddressController");
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
router.get("/", addressController.getAddressesByUserID);
router.post("/", addressController.addAddress);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);
router.put("/:id/default", addressController.setDefaultAddress);
module.exports = router;
