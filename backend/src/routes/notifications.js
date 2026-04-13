const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', NotificationController.getMyNotifications.bind(NotificationController));
router.put('/:id/read', NotificationController.markRead.bind(NotificationController));
router.put('/mark-all-read', NotificationController.markAllRead.bind(NotificationController));

module.exports = router;
