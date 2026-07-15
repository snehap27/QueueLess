


const express = require("express");
const router = express.Router();

const {
  joinQueue,
  getQueueStatus,
  getQueue,
  serveNextCustomer,
} = require("../controllers/queueController");

const protect = require("../middleware/authMiddleware");

router.post("/:businessId/join", protect, joinQueue);
router.get("/:businessId/status", protect, getQueueStatus);

// Owner APIs
router.get("/:businessId", protect, getQueue);
router.patch("/:businessId/serve", protect, serveNextCustomer);

module.exports = router;