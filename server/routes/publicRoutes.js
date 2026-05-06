import { Router } from "express";
import {
  getPublicDonorsMap,
  getPublicStats,
  getRecentRequestsPublic,
} from "../controllers/publicController.js";

const router = Router();

router.get("/donors", getPublicDonorsMap);
router.get("/stats", getPublicStats);
router.get("/recent-requests", getRecentRequestsPublic);

// Public routes error handler
router.use((err, req, res, next) => {
  console.error('❌ PUBLIC ROUTE ERROR:', err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Public route failed' });
});

export default router;
