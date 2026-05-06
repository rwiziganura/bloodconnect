import { Router } from "express";
import {
  createRequest,
  getAllRequests,
  getRequestById,
  getHospitalRequests,
  getRequestDonorResponses,
  getRequestDonors,
  updateRequestStatus,
  respondToRequest,
} from "../controllers/requestController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

// Literal paths MUST come before /:id to avoid being swallowed by the param route

// GET all open requests — any authenticated user
router.get("/", verifyToken, getAllRequests);

// GET hospital's own requests
router.get("/hospital", verifyToken, requireRole(["hospital"]), getHospitalRequests);

// POST new request — hospital, donor, or admin
router.post("/", verifyToken, requireRole(["hospital", "donor", "admin"]), createRequest);

// GET donor responses for a specific request (hospital only)
router.get("/:id/responses", verifyToken, requireRole(["hospital"]), getRequestDonorResponses);

// GET accepted donors for a request (hospital/admin view in Alerts)
router.get("/:id/donors", verifyToken, requireRole(["hospital", "admin"]), getRequestDonors);

// GET single request — any authenticated user
router.get("/:id", verifyToken, getRequestById);

// PUT update request status — hospital or admin
router.put("/:id/status", verifyToken, requireRole(["hospital", "admin"]), updateRequestStatus);

// POST donor responds to a request
router.post("/:id/respond", verifyToken, requireRole(["donor"]), respondToRequest);

// Error handler
router.use((err, req, res, next) => {
  console.error("❌ REQUEST ROUTE ERROR:", err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || "Request route failed" });
});

export default router;
