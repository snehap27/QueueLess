const express = require("express");
const protect = require("../middleware/authMiddleware");
const { createBusiness } = require("../controllers/businessController");

const router = express.Router();

router.post("/create", protect, createBusiness);

module.exports = router;