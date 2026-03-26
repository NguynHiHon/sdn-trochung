// bookingService.js - No transactions needed (standalone MongoDB compatible)
const Booking = require('../models/booking.model');
const Schedule = require('../models/schedule.model');
const Tour = require('../models/tour.model');
const Participant = require('../models/participant.model');
const BookingAssignment = require('../models/bookingAssignment.model');

let io;
const setIO = (socketIoInstance) => { io = socketIoInstance; };

const getAvailability = async (tourId, month, year) => {
    const tour = await Tour.findById(tourId);
    if (!tour) throw new Error("Tour not found");

    const filter = { tourId, status: { $in: ['Available', 'Full'] } };
    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        filter.startDate = { $gte: startDate, $lte: endDate };
    } else {
        filter.startDate = { $gte: new Date() };
    }

    return await Schedule.find(filter).sort({ startDate: 1 });
};

const holdBooking = async (bookingData) => {
    const { userId, tourId, scheduleId, totalGuests, totalPrice, contactInfo, participants } = bookingData;

    const tour = await Tour.findById(tourId);
    if (!tour) throw new Error("Tour not found");

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) throw new Error('Schedule not found');
    if (schedule.tourId.toString() !== tourId.toString()) throw new Error('Schedule does not belong to this tour');

    const remainingSlots = schedule.capacity - schedule.bookedSlots;
    if (remainingSlots < totalGuests) throw new Error('Not enough slots available');

    if (participants && participants.length !== totalGuests) {
        throw new Error('Số lượng hành khách (participants) phải bằng tổng số lượng khách (totalGuests)');
    }

    if (participants && participants.length > 0) {
        for (let p of participants) {
            if (p.dob) {
                const dob = new Date(p.dob);
                let age = new Date().getFullYear() - dob.getFullYear();
                const monthDiff = new Date().getMonth() - dob.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && new Date().getDate() < dob.getDate())) {
                    age--;
                }
                if (tour.ageMin && age < tour.ageMin) throw new Error(`Hành khách ${p.fullName} chưa đủ ${tour.ageMin} tuổi.`);
                if (tour.ageMax && age > tour.ageMax) throw new Error(`Hành khách ${p.fullName} vượt quá ${tour.ageMax} tuổi.`);
            }
        }
    }

    // Update schedule slots
    schedule.bookedSlots += totalGuests;
    if (schedule.bookedSlots >= schedule.capacity) schedule.status = 'Full';
    await schedule.save();

    const holdExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for admin follow-up
    const random = Math.floor(100000 + Math.random() * 900000);
    const bookingCode = `OXA-${new Date().getFullYear()}-${random}`;

    let booking;
    try {
        booking = new Booking({
            userId, tourId, scheduleId, bookingCode,
            totalGuests, status: 'HOLD', totalPrice, holdExpiresAt, contactInfo
        });
        await booking.save();
    } catch (err) {
        // Rollback schedule if booking save fails
        schedule.bookedSlots -= totalGuests;
        if (schedule.bookedSlots < schedule.capacity && schedule.status === 'Full') schedule.status = 'Available';
        await schedule.save();
        throw err;
    }

    try {
        if (participants && participants.length > 0) {
            const pDocs = participants.map(p => ({
                ...p,
                bookingId: booking._id,
                tourId
            }));
            await Participant.insertMany(pDocs);
        }
    } catch (err) {
        console.error('Failed to save participants, but booking was created:', err.message);
        // Don't throw - booking is still valid even if participants fail
    }

    if (io) io.to(`tour_${tourId}`).emit('availabilityUpdated', { tourId, scheduleId });

    // 🔔 Thông báo real-time cho tất cả admin
    try {
        const notificationService = require('./notification.service');
        await notificationService.notifyAllAdmins({
            type: 'new_booking',
            title: 'Booking mới',
            content: `Khách "${contactInfo.fullName}" đặt tour — ${booking.bookingCode} — ${totalGuests} khách — ${totalPrice?.toLocaleString('vi-VN')}₫`,
            relatedId: booking._id,
            relatedModel: 'Booking',
        });
    } catch (err) {
        console.error('[Notification] Failed to notify admins:', err.message);
    }

    return booking;
};

const confirmBooking = async (bookingId, userId) => {
    const query = { _id: bookingId, status: 'HOLD' };
    if (userId) query.userId = userId;

    const booking = await Booking.findOne(query);
    if (!booking) throw new Error('Booking not found or not in HOLD status');
    if (new Date() > booking.holdExpiresAt) throw new Error('Booking hold has expired');

    booking.status = 'CONFIRMED';
    booking.holdExpiresAt = undefined;
    await booking.save();
    return booking;
};

const cancelBooking = async (bookingId, userId, reason = '') => {
    const query = { _id: bookingId, status: { $in: ['HOLD', 'CONFIRMED'] } };
    if (userId) query.userId = userId;

    const booking = await Booking.findOne(query);
    if (!booking) throw new Error('Booking not found');

    const schedule = await Schedule.findById(booking.scheduleId);
    if (schedule) {
        schedule.bookedSlots -= booking.totalGuests;
        if (schedule.bookedSlots < 0) schedule.bookedSlots = 0;
        if (schedule.bookedSlots < schedule.capacity && schedule.status === 'Full') schedule.status = 'Available';
        await schedule.save();
    }

    booking.status = 'CANCELLED';
    booking.cancelReason = reason || '';
    await booking.save();

    if (io && booking.tourId) io.to(`tour_${booking.tourId}`).emit('availabilityUpdated', { tourId: booking.tourId, scheduleId: booking.scheduleId });

    return booking;
};

const completeBooking = async (bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, status: { $in: ['HOLD', 'CONFIRMED'] } });
    if (!booking) throw new Error('Booking not found or cannot be completed');

    booking.status = 'COMPLETED';
    await booking.save();

    return booking;
};

const releaseExpiredHolds = async () => {
    try {
        const now = new Date();
        const expiredBookings = await Booking.find({ status: 'HOLD', holdExpiresAt: { $lt: now } });

        for (const booking of expiredBookings) {
            try {
                const schedule = await Schedule.findById(booking.scheduleId);

                if (schedule) {
                    schedule.bookedSlots -= booking.totalGuests;
                    if (schedule.bookedSlots < 0) schedule.bookedSlots = 0;
                    if (schedule.bookedSlots < schedule.capacity && schedule.status === 'Full') schedule.status = 'Available';
                    await schedule.save();
                }

                booking.status = 'CANCELLED';
                await booking.save();

                if (io) io.to(`tour_${booking.tourId}`).emit('availabilityUpdated', { tourId: booking.tourId, scheduleId: booking.scheduleId });
            } catch (err) {
                console.error(`Failed to release hold for booking ${booking._id}:`, err);
            }
        }
    } catch (e) {
        console.error("Error in releaseExpiredHolds:", e);
    }
};

const getAllBookings = async ({ tourId, scheduleId, status, assignmentStatus, page = 1, limit = 20 }) => {
    const filter = {};
    if (tourId && tourId !== 'all') filter.tourId = tourId;
    if (scheduleId && scheduleId !== 'all') filter.scheduleId = scheduleId;
    if (status && status !== 'all') filter.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const data = await Booking.find(filter)
        .populate('tourId', 'name code')
        .populate('scheduleId', 'startDate endDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    const bookingIds = data.map((b) => b._id);
    const assignments = bookingIds.length > 0
        ? await BookingAssignment.find({ bookingId: { $in: bookingIds } })
            .populate('staffId', 'fullName username email phone')
            .populate('assignedBy', 'fullName username')
            .sort({ createdAt: -1 })
        : [];

    const assignmentMap = new Map();
    assignments.forEach((a) => {
        const key = String(a.bookingId);
        if (!assignmentMap.has(key)) assignmentMap.set(key, a);
    });

    let normalizedData = data.map((bookingDoc) => {
        const booking = bookingDoc.toObject();
        const latestAssignment = assignmentMap.get(String(booking._id));
        booking.consultantAssignment = latestAssignment
            ? {
                _id: latestAssignment._id,
                status: latestAssignment.status,
                note: latestAssignment.note,
                assignedAt: latestAssignment.createdAt,
                staff: latestAssignment.staffId || null,
                assignedBy: latestAssignment.assignedBy || null,
            }
            : null;
        return booking;
    });

    if (assignmentStatus && assignmentStatus !== 'all') {
        if (assignmentStatus === 'unassigned') {
            normalizedData = normalizedData.filter((b) => !b.consultantAssignment);
        } else {
            normalizedData = normalizedData.filter((b) => b.consultantAssignment?.status === assignmentStatus);
        }
    }

    const total = await Booking.countDocuments(filter);

    return {
        data: normalizedData,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
};

const getBookingById = async (bookingId) => {
    return await Booking.findById(bookingId)
        .populate('tourId', 'name code durationDays')
        .populate('scheduleId', 'startDate endDate');
};

module.exports = { setIO, getAvailability, holdBooking, confirmBooking, cancelBooking, completeBooking, releaseExpiredHolds, getAllBookings, getBookingById };
