const Notification = require('../models/notification.model');
const socketService = require('./socketService');

/**
 * Tạo notification + emit real-time tới user hoặc role
 */
const createNotification = async ({ recipientId, recipientRole, type, title, content, relatedId, relatedModel }) => {
    console.log(`[Notification] Creating system broadcast for role: ${recipientRole || 'none'}, user: ${recipientId || 'none'}, type: ${type}`);
    const notification = await Notification.create({
        recipientId, recipientRole, type, title, content: content || '', relatedId, relatedModel
    });

    const payload = {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        relatedId: notification.relatedId,
        isRead: false,
        createdAt: notification.createdAt,
    };

    // Emit real-time tới role nếu có recipientRole, ngược lại gửi cho user cụ thể
    if (recipientRole === 'admin') {
        console.log(`[Notification] Emitting 'newNotification' via socket to role_admin`);
        socketService.emitToAdmins('newNotification', payload);
    } else if (recipientId) {
        console.log(`[Notification] Emitting 'newNotification' via socket to user_${recipientId}`);
        socketService.emitToUser(recipientId, 'newNotification', payload);
    }

    return notification;
};

/**
 * Gửi notification cho toàn bộ Admin (Broadcast sử dụng recipientRole)
 */
const notifyAllAdmins = async ({ type, title, content, relatedId, relatedModel }) => {
    return await createNotification({
        recipientRole: 'admin', type, title, content, relatedId, relatedModel
    });
};

/**
 * Lấy danh sách notification của user + system broadcasts
 */
const getMyNotifications = async (userId, role, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    // Tìm các thông báo gửi riêng cho userId HOẶC gửi chung cho role
    const query = {
        $or: [
            { recipientId: userId },
            ...(role ? [{ recipientRole: role }] : [])
        ]
    };

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Notification.countDocuments(query),
        Notification.countDocuments({ ...query, readBy: { $ne: userId } }),
    ]);

    // Map dữ liệu để frontend dễ dàng sử dụng thuộc tính isRead
    const data = notifications.map(notif => ({
        ...notif,
        isRead: notif.readBy && notif.readBy.some(id => id.toString() === userId.toString())
    }));

    return {
        data,
        total,
        unreadCount,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

const getUnreadCount = async (userId, role) => {
    const query = {
        $or: [
            { recipientId: userId },
            ...(role ? [{ recipientRole: role }] : [])
        ],
        readBy: { $ne: userId }
    };
    return await Notification.countDocuments(query);
};

const markAsRead = async (notificationId, userId) => {
    return await Notification.findByIdAndUpdate(
        notificationId,
        { $addToSet: { readBy: userId } }, // Add user ID to readBy array if not already present
        { new: true }
    );
};

const markAllAsRead = async (userId, role) => {
    const query = {
        $or: [
            { recipientId: userId },
            ...(role ? [{ recipientRole: role }] : [])
        ],
        readBy: { $ne: userId }
    };
    return await Notification.updateMany(
        query,
        { $addToSet: { readBy: userId } }
    );
};

module.exports = { createNotification, notifyAllAdmins, getMyNotifications, getUnreadCount, markAsRead, markAllAsRead };
