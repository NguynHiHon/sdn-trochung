const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { body, param, query } = require('express-validator');
const runValidation = require('../middlewares/runValidation');
const authMiddleWare = require('../middlewares/authMiddleWare');
const { validateBookingCancel, validateBookingListQuery } = require('../validators/adminCrud.validator');

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
]), authMiddleWare.verifyAdminOrStaff, bookingController.confirmBooking);

// ── POST /booking/cancel/:id ──
router.post('/booking/cancel/:id', runValidation([
    ...validateBookingCancel,
]), authMiddleWare.verifyAdminOrStaff, bookingController.cancelBooking);

// ── POST /booking/complete/:id ──
router.post('/booking/complete/:id', runValidation([
    param('id').isMongoId().withMessage('Booking ID không hợp lệ'),
]), authMiddleWare.verifyAdminOrStaff, bookingController.completeBooking);

// ── POST /booking/payment-request/:id ──
router.post('/booking/payment-request/:id', runValidation([
    param('id').isMongoId().withMessage('Booking ID không hợp lệ'),
]), authMiddleWare.verifyAdminOrStaff, bookingController.createPaymentRequest);

// ── GET /booking/payment-info/:bookingCode (Public) ──
router.get('/booking/payment-info/:bookingCode', runValidation([
    param('bookingCode').trim().notEmpty().withMessage('bookingCode là bắt buộc'),
]), bookingController.getPaymentInfoByBookingCode);

// ── GET /bookings ──
router.get('/bookings', runValidation(validateBookingListQuery), authMiddleWare.verifyAdminOrStaff, bookingController.getAllBookings);

// ── GET /bookings/:id ──
router.get('/bookings/:id', runValidation([
    param('id').isMongoId().withMessage('Booking ID không hợp lệ'),
]), authMiddleWare.verifyAdminOrStaff, bookingController.getBookingById);

module.exports = router;
