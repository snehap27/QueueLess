const express = require("express");
const router = express.Router();

const {
  joinQueue,
  getQueueStatus
} = require("../controllers/queueController");
const protect = require("../middleware/authMiddleware");

router.post("/:businessId/join", protect, joinQueue);
router.get("/:businessId/status", protect, getQueueStatus);

module.exports = router;