const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { body, param, query, validationResult } = require('express-validator');

// ── express-validator v7: dùng .run(req) thay vì truyền validator array ──
const runValidation = (validations) => {
    return async (req, res, next) => {
        for (const validation of validations) {
            await validation.run(req);
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }
        next();
    };
};

// ── GET /availability/:tourId — Lấy lịch trống theo tour ──
router.get('/availability/:tourId', runValidation([
    param('tourId').isMongoId().withMessage('tourId không hợp lệ'),
    query('month').optional().isInt({ min: 1, max: 12 }).withMessage('month phải từ 1-12'),
    query('year').optional().isInt({ min: 2020 }).withMessage('year không hợp lệ'),
]), bookingController.getTourAvailability);

// ── POST /booking/hold — Đặt giữ chỗ ──
router.post('/booking/hold', runValidation([
    body('tourId').notEmpty().withMessage('tourId là bắt buộc').isMongoId().withMessage('tourId không hợp lệ'),
    body('scheduleId').notEmpty().withMessage('scheduleId là bắt buộc').isMongoId().withMessage('scheduleId không hợp lệ'),
    body('totalGuests').notEmpty().withMessage('Số khách là bắt buộc').isInt({ min: 1 }).withMessage('Số khách phải >= 1'),
    body('totalPrice').notEmpty().withMessage('Tổng giá là bắt buộc').isFloat({ min: 0 }).withMessage('Tổng giá không hợp lệ'),
    body('contactInfo').isObject().withMessage('contactInfo phải là object'),
    body('contactInfo.fullName').trim().notEmpty().withMessage('Họ tên người đặt là bắt buộc'),
    body('contactInfo.email').trim().notEmpty().withMessage('Email người đặt là bắt buộc').isEmail().withMessage('Email không hợp lệ'),
    body('contactInfo.phone').trim().notEmpty().withMessage('SĐT người đặt là bắt buộc'),
    body('participants').isArray({ min: 1 }).withMessage('Danh sách hành khách không được rỗng'),
    body('participants.*.fullName').trim().notEmpty().withMessage('Họ tên hành khách là bắt buộc'),
    body('participants.*.dob').notEmpty().withMessage('Ngày sinh hành khách là bắt buộc'),
    body('participants.*.gender').notEmpty().withMessage('Giới tính là bắt buộc').isIn(['Male', 'Female', 'Other']).withMessage('Giới tính phải là Male/Female/Other'),
    body('participants.*.passportOrId').trim().notEmpty().withMessage('CCCD/Hộ chiếu là bắt buộc'),
    body('participants.*.nationality').trim().notEmpty().withMessage('Quốc tịch là bắt buộc'),
]), bookingController.holdBooking);

// ── POST /booking/confirm/:id ──
router.post('/booking/confirm/:id', runValidation([
    param('id').isMongoId().withMessage('Booking ID không hợp lệ'),
]), bookingController.confirmBooking);

// ── POST /booking/cancel/:id ──
router.post('/booking/cancel/:id', runValidation([
    param('id').isMongoId().withMessage('Booking ID không hợp lệ'),
]), bookingController.cancelBooking);

// ── GET /bookings ──
router.get('/bookings', bookingController.getAllBookings);

// ── GET /bookings/:id ──
router.get('/bookings/:id', runValidation([
    param('id').isMongoId().withMessage('Booking ID không hợp lệ'),
]), bookingController.getBookingById);

module.exports = router;
