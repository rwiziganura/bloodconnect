import { Router } from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// ✅ All routes wrapped with asyncHandler to prevent crashes
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", verifyToken, asyncHandler(getMe));

// ✅ Route-specific error handler
router.use((err, req, res, next) => {
  console.error('❌ AUTH ROUTE ERROR:');
  console.error('   Path:', req.path);
  console.error('   Message:', err.message);
  console.error('   Stack:', err.stack);
  console.error('');

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({ 
    error: err.message || 'Authentication failed',
    path: req.path,
  });
});

export default router;
