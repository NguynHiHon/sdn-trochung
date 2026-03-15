const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    date: {
        type: String, // format YYYY-MM-DD
        required: true
    },
    totalSlots: {
        type: Number,
        required: true,
        min: 0
    },
    bookedSlots: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Create a unique index for tourId and date pair
availabilitySchema.index({ tourId: 1, date: 1 }, { unique: true });

// Virtual for remaining slots
availabilitySchema.virtual('remainingSlots').get(function() {
    return this.totalSlots - this.bookedSlots;
});

// Ensure virtual fields are serialized
availabilitySchema.set('toJSON', { virtuals: true });
availabilitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TourAvailability', availabilitySchema);
