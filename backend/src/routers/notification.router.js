const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const middleware = require('../middlewares/authMiddleware');

// All routes require auth
router.get('/', middleware.verifyAccessToken, notificationController.getMyNotifications);
router.get('/unread-count', middleware.verifyAccessToken, notificationController.getUnreadCount);
router.put('/:id/read', middleware.verifyAccessToken, notificationController.markAsRead);
router.put('/read-all', middleware.verifyAccessToken, notificationController.markAllAsRead);

module.exports = router;
