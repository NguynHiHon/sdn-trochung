const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingAssignmentSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        index: true,
    },
    staffId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    note: { type: String, default: '' },
}, { timestamps: true });

// Prevent duplicate assignment of same booking to same staff
bookingAssignmentSchema.index({ bookingId: 1, staffId: 1 }, { unique: true });

module.exports = mongoose.model('BookingAssignment', bookingAssignmentSchema);
