const express = require("express");
const router = express.Router();
const RatingController = require("../controllers/RatingController");
const axios = require("axios");
require("dotenv").config();
const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");
  try {
    const response = await axios.get(
      process.env.USER_SERVICE_URL + "/api/auth/validate-token",
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

router.get("/book/:bookID", RatingController.getAllRatingsByBookID);
router.get(
  "/has-purchased/:bookID",
  verifyToken,
  RatingController.hasPurchasedBook
);
router.post("/rate", verifyToken, RatingController.rateBook);

module.exports = router;
