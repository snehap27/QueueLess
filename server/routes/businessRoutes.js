const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createBusiness,
  approveBusiness,
  openQueue,
  closeQueue,
} = require("../controllers/businessController");

router.post("/create", protect, createBusiness);
router.patch("/:id/approve", protect, adminOnly, approveBusiness);
router.patch("/:id/open", protect, openQueue);
router.patch("/:id/close", protect, closeQueue);

module.exports = router;