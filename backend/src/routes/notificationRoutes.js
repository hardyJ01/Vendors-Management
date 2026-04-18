import { Router } from 'express';
import {
  createNotification,
  getNotifications,
  clearNotifications,
  markNotificationRead,
} from '../controllers/notificationController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/notify', auth, createNotification);
router.get('/get_notifications', auth, getNotifications);
router.delete('/clear_notifications', auth, clearNotifications);
router.patch('/mark_notification_read/:id', auth, markNotificationRead);

export default router;
