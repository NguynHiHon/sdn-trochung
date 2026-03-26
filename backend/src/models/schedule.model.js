const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema(
    {
        tourId: {
            type: Schema.Types.ObjectId,
            ref: 'Tour',
            required: true,
            index: true,
        },
        startDate: {
            type: Date,
            required: true,
            index: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
        bookedSlots: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ['Available', 'Full', 'Started', 'Cancelled', 'Completed'],
            default: 'Available',
            index: true,
        },
        isHidden: {
            type: Boolean,
            default: false,
            index: true,
        },
        tourGuideId: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Refers to the staff/guide assigned
        }
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to auto-toggle status based on capacity
scheduleSchema.pre('save', function () {
    if (this.bookedSlots >= this.capacity && this.status === 'Available') {
        this.status = 'Full';
    } else if (this.bookedSlots < this.capacity && this.status === 'Full') {
        this.status = 'Available';
    }
});

// A tour can only have one schedule at the exact same start time.
scheduleSchema.index({ tourId: 1, startDate: 1 }, { unique: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
