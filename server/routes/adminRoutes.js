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

const router = Router();

router.use(verifyToken, requireRole("admin"));

router.get("/users", getAllUsers);
router.put("/hospitals/:id/approve", approveHospital);
router.delete("/hospitals/:id/reject", rejectHospital);
router.delete("/users/:id", deleteUser);
router.get("/stats", getStats);
router.post("/broadcast", broadcastMessage);

// Admin routes error handler
router.use((err, req, res, next) => {
  console.error('❌ ADMIN ROUTE ERROR:', err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Admin route failed' });
});

export default router;
