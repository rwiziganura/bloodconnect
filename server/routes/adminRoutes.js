import { Router } from "express";
import {
  getAllUsers,
  approveHospital,
  rejectHospital,
  deleteUser,
  getStats,
  broadcastMessage,
} from "../controllers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.use(verifyToken, requireRole("admin"));

router.get("/users", asyncHandler(getAllUsers));
router.put("/hospitals/:id/approve", asyncHandler(approveHospital));
router.delete("/hospitals/:id/reject", asyncHandler(rejectHospital));
router.delete("/users/:id", asyncHandler(deleteUser));
router.get("/stats", asyncHandler(getStats));
router.post("/broadcast", asyncHandler(broadcastMessage));

// Admin routes error handler
router.use((err, req, res, next) => {
  console.error('❌ ADMIN ROUTE ERROR:', err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Admin route failed' });
});

export default router;
