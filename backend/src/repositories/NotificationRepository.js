const { Notification } = require('../models');

/**
 * NotificationRepository — Persists and retrieves user notifications.
 */
class NotificationRepository {
  async save(data) {
    return Notification.create(data);
  }

  async findByUser(userId) {
    return Notification.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
  }

  async markRead(id, userId) {
    return Notification.update({ readStatus: true }, { where: { id, userId } });
  }

  async markAllRead(userId) {
    return Notification.update({ readStatus: true }, { where: { userId } });
  }

  async countUnread(userId) {
    return Notification.count({ where: { userId, readStatus: false } });
  }
}

module.exports = new NotificationRepository();
