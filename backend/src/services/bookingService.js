// bookingService.js - No transactions needed (standalone MongoDB compatible)
const Booking = require('../models/booking.model');
const Schedule = require('../models/schedule.model');
const Tour = require('../models/tour.model');
const Participant = require('../models/participant.model');
const BookingAssignment = require('../models/bookingAssignment.model');

let io;
const setIO = (socketIoInstance) => { io = socketIoInstance; };

const BOOKING_CODE_PREFIX = 'OXA';
const BOOKING_CODE_SUFFIX_LEN = 10;

const randomAlnumUpper = (len) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let out = '';
    for (let i = 0; i < len; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
};

const generateUniqueBookingCode = async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
        const code = `${BOOKING_CODE_PREFIX}${randomAlnumUpper(BOOKING_CODE_SUFFIX_LEN)}`;
        // ensure uniqueness
        // eslint-disable-next-line no-await-in-loop
        const exists = await Booking.exists({ bookingCode: code });
        if (!exists) return code;
    }
    throw new Error('Không thể tạo mã booking duy nhất, vui lòng thử lại');
};

const hasStaffBookingPermission = async (bookingId, scheduleId, staffId) => {
    const assignment = await BookingAssignment.findOne({
        bookingId,
        staffId,
        status: { $in: ['in_progress', 'completed'] },
    }).select('_id');

    if (assignment) return true;

    const schedule = await Schedule.findById(scheduleId).select('tourGuideId');
    return !!(schedule?.tourGuideId && schedule.tourGuideId.toString() === staffId.toString());
};

const ensureBookingActionPermission = async (booking, actorUser) => {
    if (!actorUser) throw new Error('Thiếu thông tin người thực hiện');
    if (actorUser.role === 'admin') return;
    if (actorUser.role !== 'staff') {
        throw new Error('Bạn không có quyền thao tác booking này');
    }

    const allowed = await hasStaffBookingPermission(booking._id, booking.scheduleId, actorUser._id);
    if (!allowed) {
        throw new Error('Bạn không có quyền thao tác booking này');
    }
};

const ensureScheduleNotStarted = async (scheduleId) => {
    const schedule = await Schedule.findById(scheduleId).select('status startDate');
    if (!schedule) return;
    if (schedule.status === 'Started' || schedule.status === 'Completed') {
        throw new Error('Tour đã khởi hành/hoàn thành, không thể thao tác booking');
    }
    // Extra safety: if current time passed startDate, treat as started.
    if (schedule.startDate && schedule.startDate <= new Date()) {
        throw new Error('Tour đã khởi hành, không thể thao tác booking');
    }
};

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

    if (schedule.status && !['Available', 'Full'].includes(schedule.status)) {
        throw new Error('Không thể đặt chỗ cho lịch đã khởi hành/hủy/hoàn thành');
    }

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
    const bookingCode = await generateUniqueBookingCode();

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

const confirmBooking = async (bookingId, actorUser) => {
    const booking = await Booking.findOne({ _id: bookingId, status: 'HOLD' });
    if (!booking) throw new Error('Booking not found or not in HOLD status');
    if (new Date() > booking.holdExpiresAt) throw new Error('Booking hold has expired');

    await ensureBookingActionPermission(booking, actorUser);
    await ensureScheduleNotStarted(booking.scheduleId);

    booking.status = 'CONFIRMED';
    booking.holdExpiresAt = undefined;
    await booking.save();
    return booking;
};

const cancelBooking = async (bookingId, actorUser, reason = '') => {
    const booking = await Booking.findOne({ _id: bookingId, status: { $in: ['HOLD', 'CONFIRMED'] } });
    if (!booking) throw new Error('Booking not found');

    await ensureBookingActionPermission(booking, actorUser);
    await ensureScheduleNotStarted(booking.scheduleId);

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

const completeBooking = async (bookingId, actorUser) => {
    const booking = await Booking.findOne({ _id: bookingId, status: { $in: ['DEPARTED', 'CONFIRMED'] } });
    if (!booking) throw new Error('Booking not found or cannot be completed');

    await ensureBookingActionPermission(booking, actorUser);

    // Prefer completing bookings via schedule completion, but keep this as an admin/staff override.
    const schedule = await Schedule.findById(booking.scheduleId).select('status endDate');
    if (schedule) {
        if (schedule.status !== 'Completed' && schedule.endDate && schedule.endDate > new Date()) {
            throw new Error('Chỉ có thể hoàn thành booking sau khi tour kết thúc');
        }
    }

    booking.status = 'COMPLETED';
    await booking.save();

    return booking;
};

const createPaymentRequest = async (bookingId, actorUser) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    await ensureBookingActionPermission(booking, actorUser);
    await ensureScheduleNotStarted(booking.scheduleId);

    if (booking.status !== 'CONFIRMED') {
        throw new Error('Chỉ tạo yêu cầu thanh toán cho booking đã phê duyệt (CONFIRMED)');
    }

    if (booking.paymentRequest?.status === 'requested') {
        throw new Error('Booking này đã có yêu cầu thanh toán');
    }

    booking.paymentRequest = {
        status: 'requested',
        requestedAt: new Date(),
        requestedBy: actorUser?._id || null,
        paidAt: null,
        paidAmount: null,
        paidTxId: null,
    };
    await booking.save();

    try {
        if (actorUser?.role === 'staff') {
            const notificationService = require('./notification.service');
            await notificationService.notifyAllAdmins({
                type: 'booking_confirmed',
                title: 'Yêu cầu thanh toán mới',
                content: `Staff ${actorUser.fullName || actorUser.username} đã tạo yêu cầu thanh toán cho booking ${booking.bookingCode}.`,
                relatedId: booking._id,
                relatedModel: 'Booking',
            });
        }
    } catch (err) {
        console.error('[PaymentRequest] notify admin failed:', err.message);
    }

    return booking;
};

const getPaymentInfoByBookingCode = async (bookingCode) => {
    const normalized = String(bookingCode || '').trim().toUpperCase();
    if (!normalized) throw new Error('BOOKING_CODE_REQUIRED');

    const booking = await Booking.findOne({ bookingCode: normalized })
        .populate('tourId', 'name code')
        .select('bookingCode totalPrice status paymentRequest createdAt');

    if (!booking) {
        const err = new Error('BOOKING_NOT_FOUND');
        err.status = 404;
        throw err;
    }

    return {
        bookingCode: booking.bookingCode,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentRequest: booking.paymentRequest || { status: 'none' },
        createdAt: booking.createdAt,
        bankAccount: process.env.BANK_ACCOUNT_NUMBER || process.env.SEPAY_BANK_ACCOUNT_NUMBER || '2111644657',
        bankName: process.env.BANK_NAME || process.env.SEPAY_BANK_NAME || 'BIDV',
    };
};

const markPaidBySepayWebhook = async ({ bookingCode, amountIn, txId = null }) => {
    const normalized = String(bookingCode || '').trim().toUpperCase();
    if (!normalized) return null;

    const booking = await Booking.findOne({ bookingCode: normalized });
    if (!booking) return null;

    // Only accept payment for confirmed bookings that have requested payment
    if (booking.status !== 'CONFIRMED') return null;
    if (booking.paymentRequest?.status !== 'requested') return null;

    const expected = Number(booking.totalPrice || 0);
    const received = Number(amountIn || 0);
    if (!Number.isFinite(received) || received <= 0) return null;

    // Strict match with tiny tolerance
    if (Math.abs(received - expected) > 0.01) return null;

    booking.paymentRequest = {
        ...(booking.paymentRequest || {}),
        status: 'paid',
        paidAt: new Date(),
        paidAmount: received,
        paidTxId: txId ? String(txId) : (booking.paymentRequest?.paidTxId || null),
    };

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

const getAllBookings = async ({ tourId, scheduleId, status, assignmentStatus, page = 1, limit = 20, actorUser }) => {
    const filter = {};
    if (tourId && tourId !== 'all') filter.tourId = tourId;
    if (scheduleId && scheduleId !== 'all') filter.scheduleId = scheduleId;
    if (status && status !== 'all') filter.status = status;

    if (actorUser?.role === 'staff') {
        const [assignmentBookingIds, guidedScheduleIds] = await Promise.all([
            BookingAssignment.find({
                staffId: actorUser._id,
                status: { $in: ['in_progress', 'completed'] },
            }).distinct('bookingId'),
            Schedule.find({ tourGuideId: actorUser._id }).distinct('_id'),
        ]);

        const staffFilters = [];
        if (assignmentBookingIds.length > 0) {
            staffFilters.push({ _id: { $in: assignmentBookingIds } });
        }
        if (guidedScheduleIds.length > 0) {
            staffFilters.push({ scheduleId: { $in: guidedScheduleIds } });
        }

        if (staffFilters.length === 0) {
            return { data: [], total: 0, page: parseInt(page), totalPages: 0 };
        }
        filter.$or = staffFilters;
    }

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

const getBookingById = async (bookingId, actorUser) => {
    const booking = await Booking.findById(bookingId)
        .populate('tourId', 'name code durationDays')
        .populate('scheduleId', 'startDate endDate');

    if (!booking) return null;

    if (actorUser?.role === 'staff') {
        const allowed = await hasStaffBookingPermission(booking._id, booking.scheduleId?._id || booking.scheduleId, actorUser._id);
        if (!allowed) {
            throw new Error('Bạn không có quyền xem booking này');
        }
    }

    return booking;
};

module.exports = {
    setIO,
    getAvailability,
    holdBooking,
    confirmBooking,
    cancelBooking,
    completeBooking,
    createPaymentRequest,
    getPaymentInfoByBookingCode,
    markPaidBySepayWebhook,
    releaseExpiredHolds,
    getAllBookings,
    getBookingById,
};
