const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    recipientRole: {
        type: String,
        enum: ['admin', 'staff'],
        index: true,
    },
    type: {
        type: String,
        enum: ['new_booking', 'assignment', 'booking_confirmed', 'booking_cancelled', 'system'],
        required: true,
    },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    relatedId: { type: Schema.Types.ObjectId },
    relatedModel: { type: String, enum: ['Booking', 'BookingAssignment', null] },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }], // Tracks which users have read this broadcast
}, { timestamps: true });

// Viết hàm ảo (virtual) xử lý logic read - Nhưng ta thường xử lý lúc query service
notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
