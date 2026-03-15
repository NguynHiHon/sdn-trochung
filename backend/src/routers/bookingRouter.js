const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
};

// Get availability for a tour
router.get('/availability/:tourId', [
    param('tourId').isMongoId().withMessage('Invalid tourId format'),
    query('date').optional().isISO8601().withMessage('Invalid date format')
], validate, bookingController.getTourAvailability);

// Hold a booking
router.post('/booking/hold', [
    body('tourId').isMongoId().withMessage('Invalid tourId format'),
    body('date').isISO8601().withMessage('Invalid date format YYYY-MM-DD'),
    body('numberOfGuests').isInt({ min: 1 }).withMessage('numberOfGuests must be at least 1'),
    body('guestInfo').isObject().withMessage('guestInfo object is required'),
    body('guestInfo.name').notEmpty().withMessage('guestName is required'),
    body('guestInfo.email').isEmail().withMessage('Invalid email format'),
    body('guestInfo.phone').notEmpty().withMessage('Phone format is required')
], validate, bookingController.holdBooking);

// Confirm a booking
router.post('/booking/confirm/:id', [
    param('id').isMongoId().withMessage('Invalid booking ID')
], validate, bookingController.confirmBooking);

// Cancel a booking
router.post('/booking/cancel/:id', [
    param('id').isMongoId().withMessage('Invalid booking ID')
], validate, bookingController.cancelBooking);

module.exports = router;
