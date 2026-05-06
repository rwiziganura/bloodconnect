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
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// Protected donor routes - all require authentication and donor role
router.get('/me/dashboard',
  verifyToken,
  requireRole('donor'),
  asyncHandler(getDonorDashboard)
);

router.get('/me/alerts',
  verifyToken,
  requireRole('donor'),
  asyncHandler(getDonorAlerts)
);

router.get('/me/history',
  verifyToken,
  requireRole('donor'),
  asyncHandler(getDonorHistory)
);

router.put('/me/availability',
  verifyToken,
  requireRole('donor'),
  asyncHandler(toggleAvailability)
);

router.patch('/me/availability',
  verifyToken,
  requireRole('donor'),
  asyncHandler(updateDonorAvailability)
);

router.get('/profile/me',
  verifyToken,
  requireRole('donor'),
  asyncHandler(getDonorProfile)
);

router.put('/profile/me',
  verifyToken,
  requireRole('donor'),
  asyncHandler(updateDonorProfile)
);

// Donor routes error handler
router.use((err, req, res, next) => {
  console.error('❌ DONOR ROUTE ERROR:', err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Donor route failed' });
});

export default router;
