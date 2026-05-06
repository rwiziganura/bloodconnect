import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(verifyToken);

router.get('/', asyncHandler(getMyNotifications));
router.get('/unread-count', asyncHandler(getUnreadCount));
router.put('/mark-all-read', asyncHandler(markAllAsRead));
router.put('/:id/read', asyncHandler(markAsRead));

export default router;
