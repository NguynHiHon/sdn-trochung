const bookingService = require('../services/bookingService');

const getTourAvailability = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { month, year } = req.query;

        const availability = await bookingService.getAvailability(tourId, month, year);
        
        const responseData = availability.map(a => ({
            id: a._id,
            tourId: a.tourId,
            scheduleId: a._id,
            startDate: a.startDate,
            endDate: a.endDate,
            totalSlots: a.capacity,
            bookedSlots: a.bookedSlots,
            remainingSlots: a.capacity - a.bookedSlots,
            status: a.status
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
        const userId = req.user?._id || req.body.userId; // user optional
        const { tourId, scheduleId, totalGuests, totalPrice, contactInfo, participants } = req.body;

        const newBooking = await bookingService.holdBooking({
            userId,
            tourId,
            scheduleId,
            totalGuests: Number(totalGuests),
            totalPrice: Number(totalPrice),
            contactInfo,
            participants
        });

        res.status(201).json({ 
            success: true, 
            bookingCode: newBooking.bookingCode,
            data: newBooking, 
            message: 'Đặt tour thành công! Nhân viên sẽ liên hệ bạn trong 24 giờ.' 
        });
    } catch (error) {
        console.error('[holdBooking] ERROR:', error.message);
        console.error('[holdBooking] STACK:', error.stack);
        console.error('[holdBooking] REQ BODY:', JSON.stringify(req.body, null, 2));
        
        const _msg = error.message;
        if (_msg.includes('Tuổi') || _msg.includes('participants') || _msg.includes('bắt buộc')) {
            return res.status(400).json({ success: false, message: _msg });
        }
        if (_msg === 'Tour not found' || _msg === 'Schedule not found') {
            return res.status(404).json({ success: false, message: _msg });
        }
        if (_msg === 'Not enough slots available' || _msg.includes('slots')) {
            return res.status(409).json({ success: false, message: _msg });
        }
        res.status(500).json({ success: false, message: _msg });
    }
};

const confirmBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id || req.body.userId;

        const confirmedBooking = await bookingService.confirmBooking(id, userId);
        res.status(200).json({ success: true, data: confirmedBooking, message: 'Booking confirmed successfully' });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('expired')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id || req.body.userId; 

        const cancelledBooking = await bookingService.cancelBooking(id, userId);
        res.status(200).json({ success: true, data: cancelledBooking, message: 'Booking cancelled successfully' });
    } catch (error) {
        if (error.message === 'Booking not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const result = await bookingService.getAllBookings(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getTourAvailability,
    holdBooking,
    confirmBooking,
    cancelBooking,
    getAllBookings,
    getBookingById
};
