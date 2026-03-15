const bookingService = require('../services/bookingService');

const getTourAvailability = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { date } = req.query; // optional

        const availability = await bookingService.getAvailability(tourId, date);
        // Map to include remainingSlots correctly (handling mongoose virtuals safely)
        const responseData = availability.map(a => ({
            id: a._id,
            tourId: a.tourId,
            date: a.date,
            totalSlots: a.totalSlots,
            bookedSlots: a.bookedSlots,
            remainingSlots: a.totalSlots - a.bookedSlots
        }));
        
        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        if (error.message === 'Tour not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const holdBooking = async (req, res) => {
    try {
        // user should be authenticated, but we simulate it or pull from token
        // assuming req.user._id is available via auth middleware, fallback to body
        const userId = req.user?._id || req.body.userId;
        const { tourId, date, numberOfGuests, totalPrice, guestInfo } = req.body;

        if(!userId) {
            return res.status(401).json({ success: false, message: 'User must be logged in' });
        }

        const newBooking = await bookingService.holdBooking({
            userId,
            tourId,
            date,
            numberOfGuests: Number(numberOfGuests),
            totalPrice: Number(totalPrice),
            guestInfo
        });

        // The example requirement expects bookingCode at root
        res.status(201).json({ 
            success: true, 
            bookingCode: newBooking.bookingCode,
            data: newBooking, 
            message: 'Booking held for 15 minutes' 
        });
    } catch (error) {
        if (error.message === 'Invalid date format' || error.message === 'Cannot book past dates') {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message === 'Tour not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === 'Not enough slots available' || error.message === 'Tour slot not available for this date') {
            return res.status(409).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const confirmBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id || req.body.userId;

        const confirmedBooking = await bookingService.confirmBooking(id, userId);

        res.status(200).json({ success: true, data: confirmedBooking, message: 'Booking confirmed successfully' });
    } catch (error) {
        if (error.message === 'Booking not found or not in HOLD status') {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === 'Booking hold has expired') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id || req.body.userId; // only own user can cancel

        const cancelledBooking = await bookingService.cancelBooking(id, userId);

        res.status(200).json({ success: true, data: cancelledBooking, message: 'Booking cancelled successfully' });
    } catch (error) {
        if (error.message === 'Booking not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getTourAvailability,
    holdBooking,
    confirmBooking,
    cancelBooking
};
