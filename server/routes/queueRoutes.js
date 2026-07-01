const express = require("express");
const router = express.Router();

const {
  joinQueue,
  getQueueStatus,
  serveNextCustomer,
} = require("../controllers/queueController");
const protect = require("../middleware/authMiddleware");

router.post("/:businessId/join", protect, joinQueue);
router.get("/:businessId/status", protect, getQueueStatus);
router.patch("/:businessId/serve-next", protect, serveNextCustomer);

module.exports = router;