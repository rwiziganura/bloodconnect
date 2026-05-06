import express from 'express';
import * as donorAcceptanceController from '../controllers/donorAcceptanceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

// Public route - anyone can submit acceptance
router.post('/accept', asyncHandler(donorAcceptanceController.submitDonorAcceptance));

// Hospital routes
router.get(
  '/hospital/acceptances',
  verifyToken,
  requireRole('hospital'),
  asyncHandler(donorAcceptanceController.getHospitalDonorAcceptances)
);

router.get(
  '/hospital/request/:request_id/acceptances',
  verifyToken,
  requireRole('hospital'),
  asyncHandler(donorAcceptanceController.getRequestDonorAcceptances)
);

router.put(
  '/hospital/approve/:id',
  verifyToken,
  requireRole('hospital'),
  asyncHandler(donorAcceptanceController.approveDonorAcceptance)
);

router.put(
  '/hospital/reject/:id',
  verifyToken,
  requireRole('hospital'),
  asyncHandler(donorAcceptanceController.rejectDonorAcceptance)
);

// Donor routes
router.get(
  '/donor/my-acceptances',
  verifyToken,
  requireRole('donor'),
  asyncHandler(donorAcceptanceController.getDonorOwnAcceptances)
);

export default router;
