const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const middleware = require('../middlewares/authMiddleWare');
const { body, param, validationResult } = require('express-validator');

const runValidation = (validations) => {
    return async (req, res, next) => {
        for (const validation of validations) {
            await validation.run(req);
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
        }
        next();
    };
};

const scheduleCreateValidators = [
    body('tourId').isMongoId().withMessage('tourId không hợp lệ'),
    body('startDate').notEmpty().withMessage('startDate là bắt buộc').isISO8601().withMessage('startDate không hợp lệ'),
    body('endDate').notEmpty().withMessage('endDate là bắt buộc').isISO8601().withMessage('endDate không hợp lệ'),
    body('capacity').isInt({ min: 1 }).withMessage('capacity phải >= 1'),
    body('bookedSlots').optional().isInt({ min: 0 }).withMessage('bookedSlots không hợp lệ'),
    body('status').optional().isIn(['Available', 'Full', 'Cancelled', 'Completed']).withMessage('Trạng thái lịch không hợp lệ'),
    body('tourGuideId').optional({ checkFalsy: true }).isMongoId().withMessage('tourGuideId không hợp lệ'),
    body().custom((value) => {
        if (new Date(value.endDate) < new Date(value.startDate)) {
            throw new Error('endDate phải sau hoặc bằng startDate');
        }
        return true;
    }),
];

const scheduleUpdateValidators = [
    param('id').isMongoId().withMessage('ID lịch không hợp lệ'),
    body('tourId').optional().isMongoId().withMessage('tourId không hợp lệ'),
    body('startDate').optional().isISO8601().withMessage('startDate không hợp lệ'),
    body('endDate').optional().isISO8601().withMessage('endDate không hợp lệ'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('capacity phải >= 1'),
    body('bookedSlots').optional().isInt({ min: 0 }).withMessage('bookedSlots không hợp lệ'),
    body('status').optional().isIn(['Available', 'Full', 'Cancelled', 'Completed']).withMessage('Trạng thái lịch không hợp lệ'),
    body('tourGuideId').optional({ checkFalsy: true }).isMongoId().withMessage('tourGuideId không hợp lệ'),
    body().custom((value) => {
        if (value.startDate && value.endDate && new Date(value.endDate) < new Date(value.startDate)) {
            throw new Error('endDate phải sau hoặc bằng startDate');
        }
        return true;
    }),
];

const scheduleBulkValidators = [
    body('tourId').isMongoId().withMessage('tourId không hợp lệ'),
    body('dates').isArray({ min: 1 }).withMessage('dates phải là mảng và không được rỗng'),
    body('dates.*').isISO8601().withMessage('Mỗi phần tử dates phải là ngày hợp lệ (ISO8601)'),
];

// Public routes - anyone can view schedules
router.get('/', scheduleController.getAllSchedules);
router.get('/:id', scheduleController.getScheduleById);

// Admin only routes - create, update, delete schedules
router.post('/', middleware.verifyAdmin, runValidation(scheduleCreateValidators), scheduleController.createSchedule);
router.post('/bulk', middleware.verifyAdmin, runValidation(scheduleBulkValidators), scheduleController.bulkCreateSchedules);
router.put('/:id', middleware.verifyAdmin, runValidation(scheduleUpdateValidators), scheduleController.updateSchedule);
router.delete('/:id', middleware.verifyAdmin, scheduleController.deleteSchedule);

module.exports = router;
