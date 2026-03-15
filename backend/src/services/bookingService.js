const mongoose = require('mongoose');
const Booking = require('../models/booking.model');
const TourAvailability = require('../models/availability.model');
const Tour = require('../models/tour.model');

// Access socket.io instance
let io;
const setIO = (socketIoInstance) => {
    io = socketIoInstance;
};

const getAvailability = async (tourId, date = null) => {
    const tour = await Tour.findById(tourId);
    if (!tour) {
        throw new Error("Tour not found");
    }

    let query = { tourId };
    if (date) {
        query.date = date;
    }
    const availability = await TourAvailability.find(query);
    return availability; // Mongoose virtual remainingSlots will be included (if set up well, or we just map it)
};

const holdBooking = async (bookingData) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { userId, tourId, date, numberOfGuests, totalPrice, guestInfo } = bookingData;

        // Date Validation
        if (!date || isNaN(new Date(date).getTime())) {
            throw new Error("Invalid date format");
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // start of day for accurate comparison
        
        const bookingDate = new Date(date);
        if (bookingDate < today) {
            throw new Error("Cannot book past dates");
        }

        // Tour existence validation
        const tour = await Tour.findById(tourId).session(session);
        if (!tour) {
            throw new Error("Tour not found");
        }

        // Find availability for this date
        const availability = await TourAvailability.findOne({ tourId, date }).session(session);
        
        if (!availability) {
            throw new Error('Tour slot not available for this date');
        }

        const remainingSlots = availability.totalSlots - availability.bookedSlots;
        
        if (remainingSlots < numberOfGuests) {
            throw new Error('Not enough slots available');
        }

        // Increment booked slots
        availability.bookedSlots += numberOfGuests;
        await availability.save({ session });

        // Create hold booking
        const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        
        // Generate booking Code
        const random = Math.floor(100000 + Math.random() * 900000);
        const bookingCode = `OXA-${new Date().getFullYear()}-${random}`;

        const booking = new Booking({
            userId,
            tourId,
            date,
            bookingCode,
            numberOfGuests,
            status: 'HOLD',
            totalPrice,
            holdExpiresAt,
            guestInfo
        });

        await booking.save({ session });
        
        await session.commitTransaction();

        // Emit event to room
        if (io) {
            io.to(`tour_${tourId}`).emit('availabilityUpdated', { tourId, date });
        }
        
        return booking;
    } catch (err) {
        await session.abortTransaction();
        console.error("Transaction error holding booking:", err);
        throw err;
    } finally {
        session.endSession();
    }
};

const confirmBooking = async (bookingId, userId) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const booking = await Booking.findOne({ _id: bookingId, userId, status: 'HOLD' }).session(session);
        
        if (!booking) {
            throw new Error('Booking not found or not in HOLD status');
        }

        // Check if hold expired
        if (new Date() > booking.holdExpiresAt) {
            throw new Error('Booking hold has expired');
        }

        booking.status = 'CONFIRMED';
        booking.holdExpiresAt = undefined;
        await booking.save({ session });

        await session.commitTransaction();
        return booking;
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
};

const cancelBooking = async (bookingId, userId) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const booking = await Booking.findOne({ _id: bookingId, userId, status: { $in: ['HOLD', 'CONFIRMED'] } }).session(session);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Release slots
        const availability = await TourAvailability.findOne({ tourId: booking.tourId, date: booking.date }).session(session);
        if (availability) {
            availability.bookedSlots -= booking.numberOfGuests;
            // Prevent negative bookedSlots just in case
            if(availability.bookedSlots < 0) availability.bookedSlots = 0;
            await availability.save({ session });
        }

        booking.status = 'CANCELLED';
        await booking.save({ session });

        await session.commitTransaction();

        if (io && booking.tourId) {
            io.to(`tour_${booking.tourId}`).emit('availabilityUpdated', { tourId: booking.tourId, date: booking.date });
        }

        return booking;
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
};

// Background task to run every 5 minutes
const releaseExpiredHolds = async () => {
    try {
        const now = new Date();
        const expiredBookings = await Booking.find({
            status: 'HOLD',
            holdExpiresAt: { $lt: now }
        });

        for (const booking of expiredBookings) {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();
                const availability = await TourAvailability.findOne({ tourId: booking.tourId, date: booking.date }).session(session);
                
                if (availability) {
                    availability.bookedSlots -= booking.numberOfGuests;
                    if(availability.bookedSlots < 0) availability.bookedSlots = 0;
                    await availability.save({ session });
                }

                booking.status = 'CANCELLED';
                await booking.save({ session });
                await session.commitTransaction();
                
                if (io) {
                    io.to(`tour_${booking.tourId}`).emit('availabilityUpdated', { tourId: booking.tourId, date: booking.date });
                }
            } catch (err) {
                console.error(`Failed to release hold for booking ${booking._id}:`, err);
                await session.abortTransaction();
            } finally {
                session.endSession();
            }
        }
    } catch (e) {
        console.error("Error in releaseExpiredHolds:", e);
    }
};

const generateTourAvailability = async (tourId, groupSize = 10) => {
    const today = new Date();
    const availabilityDocs = [];
    
    // Generate for next 365 days
    for (let i = 0; i < 365; i++) {
        const dateObj = new Date(today);
        dateObj.setDate(today.getDate() + i);
        const dateStr = dateObj.toISOString().split('T')[0];
        
        availabilityDocs.push({
            tourId,
            date: dateStr,
            totalSlots: groupSize,
            bookedSlots: 0
        });
    }

    try {
        await TourAvailability.insertMany(availabilityDocs, { ordered: false });
    } catch (err) {
        if (err.code !== 11000) {
            console.error('Error generating availability:', err);
        }
    }
};

module.exports = {
    setIO,
    getAvailability,
    holdBooking,
    confirmBooking,
    cancelBooking,
    releaseExpiredHolds,
    generateTourAvailability
};
