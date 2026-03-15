const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    bookingCode: {
        type: String,
        unique: true
    },
    date: {
        type: String, // format YYYY-MM-DD
        required: true
    },
    numberOfGuests: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['HOLD', 'CONFIRMED', 'CANCELLED'],
        default: 'HOLD'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    holdExpiresAt: {
        type: Date,
        required: function() {
            return this.status === 'HOLD';
        }
    },
    guestInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        specialRequest: { type: String }
    }
}, {
    timestamps: true
});

// Index to quickly find bookings for a tour on a date
bookingSchema.index({ tourId: 1, date: 1 });

// Index for background job to find expired holds
bookingSchema.index({ status: 1, holdExpiresAt: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
