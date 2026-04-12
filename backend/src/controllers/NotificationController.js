const NotificationRepository = require('../repositories/NotificationRepository');

/**
 * NotificationController — Handles notification endpoints.
 */
class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const notifications = await NotificationRepository.findByUser(req.user.id);
      const unread = await NotificationRepository.countUnread(req.user.id);
      res.json({ success: true, data: notifications, unread });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      await NotificationRepository.markRead(req.params.id, req.user.id);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await NotificationRepository.markAllRead(req.user.id);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
