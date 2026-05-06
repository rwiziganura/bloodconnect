import { Router } from "express";
import {
  getPublicDonorsMap,
  getPublicStats,
  getRecentRequestsPublic,
} from "../controllers/publicController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/donors", asyncHandler(getPublicDonorsMap));
router.get("/stats", asyncHandler(getPublicStats));
router.get("/recent-requests", asyncHandler(getRecentRequestsPublic));

// Public routes error handler
router.use((err, req, res, next) => {
  console.error('❌ PUBLIC ROUTE ERROR:', err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Public route failed' });
});

export default router;
