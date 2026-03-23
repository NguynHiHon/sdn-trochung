const BookingAssignment = require('../models/bookingAssignment.model');
const Booking = require('../models/booking.model');
const notificationService = require('./notification.service');

const assignBooking = async ({ bookingId, staffId, assignedBy, note }) => {
    // Check booking exists
    const booking = await Booking.findById(bookingId).populate('tourId', 'name code');
    if (!booking) throw new Error('Booking not found');

    // Create assignment
    const assignment = await BookingAssignment.create({
        bookingId, staffId, assignedBy, note: note || '',
        status: 'pending',
    });

    // Notify staff real-time
    const tourName = booking.tourId?.name?.vi || booking.tourId?.code || 'N/A';
    await notificationService.createNotification({
        recipientId: staffId,
        type: 'assignment',
        title: 'Phân công tư vấn mới',
        content: `Bạn được phân công tư vấn booking ${booking.bookingCode} — Tour: ${tourName}`,
        relatedId: assignment._id,
        relatedModel: 'BookingAssignment',
    });

    return await BookingAssignment.findById(assignment._id)
        .populate('bookingId', 'bookingCode totalGuests totalPrice contactInfo')
        .populate('staffId', 'fullName username email phone')
        .populate('assignedBy', 'fullName username');
};

const getAssignments = async ({ staffId, status, page = 1, limit = 20 }) => {
    const filter = {};
    if (staffId && staffId !== 'all') filter.staffId = staffId;
    if (status && status !== 'all') filter.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
        BookingAssignment.find(filter)
            .populate({
                path: 'bookingId',
                select: 'bookingCode totalGuests totalPrice contactInfo status tourId scheduleId',
                populate: [
                    { path: 'tourId', select: 'name code' },
                    { path: 'scheduleId', select: 'startDate endDate' },
                ],
            })
            .populate('staffId', 'fullName username email phone')
            .populate('assignedBy', 'fullName username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        BookingAssignment.countDocuments(filter),
    ]);

    return { data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
};

const updateAssignmentStatus = async (assignmentId, status, userId) => {
    const assignment = await BookingAssignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    assignment.status = status;
    await assignment.save();

    // Notify admin when staff updates status
    if (status === 'completed') {
        const booking = await Booking.findById(assignment.bookingId).populate('tourId', 'name code');
        await notificationService.notifyAllAdmins({
            type: 'system',
            title: 'Tư vấn hoàn thành',
            content: `Nhân viên đã hoàn thành tư vấn booking ${booking?.bookingCode || 'N/A'}`,
            relatedId: assignment._id,
            relatedModel: 'BookingAssignment',
        });
    }

    return await BookingAssignment.findById(assignmentId)
        .populate({
            path: 'bookingId',
            select: 'bookingCode totalGuests totalPrice contactInfo status tourId scheduleId',
            populate: [
                { path: 'tourId', select: 'name code' },
                { path: 'scheduleId', select: 'startDate endDate' },
            ],
        })
        .populate('staffId', 'fullName username')
        .populate('assignedBy', 'fullName username');
};

module.exports = { assignBooking, getAssignments, updateAssignmentStatus };
