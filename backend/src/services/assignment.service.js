const BookingAssignment = require('../models/bookingAssignment.model');
const Booking = require('../models/booking.model');
const User = require('../models/Users');
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
    if (!['in_progress', 'cancelled'].includes(status)) {
        throw new Error('Nhân viên chỉ có thể Tiếp nhận hoặc Từ chối yêu cầu tư vấn');
    }

    const assignment = await BookingAssignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    // Staff chỉ được thao tác assignment của chính mình
    if (assignment.staffId.toString() !== userId.toString()) {
        throw new Error('Bạn không có quyền thao tác assignment này');
    }

    // Chỉ xử lý ở trạng thái chờ
    if (assignment.status !== 'pending') {
        throw new Error('Assignment này đã được xử lý trước đó');
    }

    const staff = await User.findById(userId).select('fullName username');
    const booking = await Booking.findById(assignment.bookingId).populate('tourId', 'name code');

    if (status === 'cancelled') {
        // Từ chối: gỡ staff khỏi booking bằng cách xóa assignment
        await BookingAssignment.deleteOne({ _id: assignmentId });

        await notificationService.notifyAllAdmins({
            type: 'assignment',
            title: 'Nhân viên từ chối tư vấn',
            content: `${staff?.fullName || staff?.username || 'Nhân viên'} đã từ chối booking ${booking?.bookingCode || 'N/A'}. Vui lòng phân công người khác.`,
            relatedId: booking?._id || assignmentId,
            relatedModel: 'Booking',
        });

        return {
            _id: assignmentId,
            bookingId: booking,
            staffId: staff,
            assignedBy: assignment.assignedBy,
            status: 'cancelled',
            removed: true,
        };
    }

    assignment.status = status;
    await assignment.save();

    await notificationService.notifyAllAdmins({
        type: 'assignment',
        title: 'Nhân viên đã tiếp nhận tư vấn',
        content: `${staff?.fullName || staff?.username || 'Nhân viên'} đã tiếp nhận booking ${booking?.bookingCode || 'N/A'}.`,
        relatedId: assignment._id,
        relatedModel: 'BookingAssignment',
    });

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
