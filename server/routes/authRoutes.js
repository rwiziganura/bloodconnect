import { Router } from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);

// Auth routes error handler
router.use((err, req, res, next) => {
  console.error('❌ AUTH ROUTE ERROR:', err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Auth route failed' });
});

export default router;
