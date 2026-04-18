import Notification from '../models/Notification.js';
import { ansyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// POST /api/notify
export const createNotification = ansyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { vendor_id, message, link } = req.body;

  if (!vendor_id || !message) {
    return res.status(400).json({ status: 400, message: 'vendor_id and message are required', error: 'Bad Request' });
  }

  const notification = await Notification.create({
    user_id: userId,
    vendor_id,
    message,
    link: link || '',
  });

  res.status(201).json(new ApiResponse(201, 'Notification created successfully', notification));
});

// GET /api/get_notifications
export const getNotifications = ansyncHandler(async (req, res) => {
  const userId = req.user.id;

  const notifications = await Notification.find({ user_id: userId })
    .populate('vendor_id', 'name business profile_pic')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = notifications.map(n => ({
    _id: n._id,
    vendor_id: n.vendor_id?._id || n.vendor_id,
    vendor_name: n.vendor_id?.name || 'Unknown',
    vendor_pic: n.vendor_id?.profile_pic || '',
    message: n.message,
    link: n.link,
    read: n.read,
    created_at: n.createdAt,
  }));

  res.status(200).json(new ApiResponse(200, 'Notifications fetched successfully', formatted));
});

// DELETE /api/clear_notifications
export const clearNotifications = ansyncHandler(async (req, res) => {
  const userId = req.user.id;
  await Notification.deleteMany({ user_id: userId });

  res.status(200).json(new ApiResponse(200, 'All notifications cleared'));
});

// PATCH /api/mark_notification_read/:id
export const markNotificationRead = ansyncHandler(async (req, res) => {
  const notifId = req.params.id;
  await Notification.findByIdAndUpdate(notifId, { read: true });
  res.status(200).json(new ApiResponse(200, 'Notification marked as read'));
});
