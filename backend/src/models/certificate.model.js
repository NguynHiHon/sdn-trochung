const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
    {
        certificateCode: { type: String, unique: true, required: true },
        participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
        bookingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking',     required: true },
        tourId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Tour',        required: true },
        scheduleId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule',    required: true },
        participantName: { type: String, required: true },
        tourName:        { type: String, required: true },
        startDate:       { type: Date,   required: true },
        endDate:         { type: Date,   required: true },
        issuedAt:        { type: Date,   default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
