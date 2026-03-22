const notificationService = require('../services/notification.service');

const getMyNotifications = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const result = await notificationService.getMyNotifications(req.user._id, req.user.role, page, limit);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id, req.user.role);
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        await notificationService.markAsRead(req.params.id, req.user._id);
        res.status(200).json({ success: true, message: 'OK' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user._id);
        res.status(200).json({ success: true, message: 'OK' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead };
