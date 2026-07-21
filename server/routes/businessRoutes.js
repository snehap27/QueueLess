const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");


const {
  createBusiness,
  getMyBusiness,
  approveBusiness,
  openQueue,
  closeQueue,
  getBusinesses,
} = require("../controllers/businessController");
router.get("/", protect, getBusinesses);
router.get("/my-business", protect, getMyBusiness);
router.post("/", protect, createBusiness);
router.post("/create", protect, createBusiness);
router.patch("/:id/approve", protect, adminOnly, approveBusiness);
router.patch("/:id/open", protect, openQueue);
router.patch("/:id/close", protect, closeQueue);

module.exports = router;
