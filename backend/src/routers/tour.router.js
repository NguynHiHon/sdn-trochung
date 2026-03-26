const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
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

const tourCreateValidators = [
    body('name.vi').trim().notEmpty().withMessage('Tên tour (VI) là bắt buộc'),
    body('name.en').trim().notEmpty().withMessage('Tên tour (EN) là bắt buộc'),
    body('description.vi').trim().notEmpty().withMessage('Mô tả ngắn (VI) là bắt buộc'),
    body('description.en').trim().notEmpty().withMessage('Mô tả ngắn (EN) là bắt buộc'),
    body('code').trim().notEmpty().withMessage('Mã tour là bắt buộc'),
    body('slug').trim().notEmpty().withMessage('Slug là bắt buộc'),
    body('priceVND').isFloat({ gt: 0 }).withMessage('Giá VND phải lớn hơn 0'),
    body('durationDays').isInt({ gt: 0 }).withMessage('Số ngày phải lớn hơn 0'),
    body('adventureLevel').isInt({ min: 1, max: 6 }).withMessage('Độ khó phải từ 1 đến 6'),
    body('tourType').isIn(['multiday', 'overnight', 'daytour', 'family']).withMessage('Loại tour không hợp lệ'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Trạng thái không hợp lệ'),
];

const tourUpdateValidators = [
    param('id').isMongoId().withMessage('ID tour không hợp lệ'),
    body('name.vi').optional().trim().notEmpty().withMessage('Tên tour (VI) không được để trống'),
    body('name.en').optional().trim().notEmpty().withMessage('Tên tour (EN) không được để trống'),
    body('description.vi').optional().trim().notEmpty().withMessage('Mô tả ngắn (VI) không được để trống'),
    body('description.en').optional().trim().notEmpty().withMessage('Mô tả ngắn (EN) không được để trống'),
    body('code').optional().trim().notEmpty().withMessage('Mã tour không được để trống'),
    body('slug').optional().trim().notEmpty().withMessage('Slug không được để trống'),
    body('priceVND').optional().isFloat({ gt: 0 }).withMessage('Giá VND phải lớn hơn 0'),
    body('durationDays').optional().isInt({ gt: 0 }).withMessage('Số ngày phải lớn hơn 0'),
    body('adventureLevel').optional().isInt({ min: 1, max: 6 }).withMessage('Độ khó phải từ 1 đến 6'),
    body('tourType').optional().isIn(['multiday', 'overnight', 'daytour', 'family']).withMessage('Loại tour không hợp lệ'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Trạng thái không hợp lệ'),
];

// Public routes - anyone can view tours
router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);

// Admin only routes - create, update, delete tours
router.post('/', middleware.verifyAdmin, runValidation(tourCreateValidators), tourController.createTour);
router.put('/:id', middleware.verifyAdmin, runValidation(tourUpdateValidators), tourController.updateTour);
router.delete('/:id', middleware.verifyAdmin, tourController.deleteTour);

module.exports = router;
