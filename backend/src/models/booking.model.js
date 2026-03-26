const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Optional: Allow guest bookings
    },
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: true
    },
    bookingCode: {
        type: String,
        unique: true
    },
    totalGuests: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['HOLD', 'CONFIRMED', 'DEPARTED', 'CANCELLED', 'COMPLETED'],
        default: 'HOLD'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    holdExpiresAt: {
        type: Date,
        required: function () {
            return this.status === 'HOLD';
        }
    },
    contactInfo: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        contactMethod: {
            type: String,
            enum: ['Zalo', 'Viber', 'Email', 'WhatsApp', 'Phone', 'None'],
            default: 'Zalo'
        },
        address: { type: String },
        specialRequest: { type: String }
    },
    paymentRequest: {
        status: {
            type: String,
            enum: ['none', 'requested', 'paid'],
            default: 'none',
        },
        requestedAt: { type: Date, default: null },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        paidAt: { type: Date, default: null },
        paidAmount: { type: Number, default: null },
        paidTxId: { type: String, default: null },
    },
    cancelReason: { type: String, default: '' },
}, {
    timestamps: true
});

// Index to quickly find bookings for a schedule or tour
bookingSchema.index({ scheduleId: 1 });
bookingSchema.index({ tourId: 1 });

// Index for background job to find expired holds
bookingSchema.index({ status: 1, holdExpiresAt: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
