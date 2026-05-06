import { Router } from "express";
import {
  getHospitalProfile,
  updateHospitalProfile,
} from "../controllers/hospitalController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.get(
  "/me",
  verifyToken,
  requireRole(["hospital"]),
  getHospitalProfile
);
router.put(
  "/me",
  verifyToken,
  requireRole(["hospital"]),
  updateHospitalProfile
);

// Hospital routes error handler
router.use((err, req, res, next) => {
  console.error('❌ HOSPITAL ROUTE ERROR:', err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Hospital route failed' });
});

export default router;
