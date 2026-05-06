import { Router } from "express";
import {
  getDonorDashboard,
  updateDonorAvailability,
  getDonorAlerts,
  getDonorHistory,
  getDonorProfile,
  updateDonorProfile,
  toggleAvailability,
} from "../controllers/donorController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(verifyToken, requireRole("donor"));

router.get("/me/dashboard", getDonorDashboard);
router.patch("/me/availability", updateDonorAvailability);
router.get("/me/alerts", getDonorAlerts);
router.get("/me/history", getDonorHistory);
router.get("/profile/me", getDonorProfile);
router.put("/profile/me", updateDonorProfile);
router.put("/availability", toggleAvailability);

// Donor routes error handler
router.use((err, req, res, next) => {
  console.error('❌ DONOR ROUTE ERROR:', err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Donor route failed' });
});

export default router;
