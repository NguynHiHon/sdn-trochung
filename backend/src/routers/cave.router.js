const express = require('express');
const router = express.Router();
const caveController = require('../controllers/cave.controller');
const middleware = require('../middlewares/authMiddleWare');
const { body, param, validationResult } = require('express-validator');

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
                errors: errors.array(),
            });
        }
        next();
    };
};

const caveCreateValidators = [
    body('name.vi').trim().notEmpty().withMessage('Tên hang động (VI) là bắt buộc'),
    body('name.en').trim().notEmpty().withMessage('Tên hang động (EN) là bắt buộc'),
    body('location.lat').optional({ nullable: true }).isFloat({ min: -90, max: 90 }).withMessage('Vĩ độ phải trong khoảng -90 đến 90'),
    body('location.lng').optional({ nullable: true }).isFloat({ min: -180, max: 180 }).withMessage('Kinh độ phải trong khoảng -180 đến 180'),
    body('length').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Chiều dài không hợp lệ'),
    body('depth').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Độ sâu không hợp lệ'),
    body('heritageLevel').optional().isIn(['world', 'national', 'provincial', 'none']).withMessage('heritageLevel không hợp lệ'),
    body().custom((value) => {
        const hasLat = value?.location?.lat !== undefined && value?.location?.lat !== '';
        const hasLng = value?.location?.lng !== undefined && value?.location?.lng !== '';
        if (hasLat !== hasLng) {
            throw new Error('Cần nhập đầy đủ cả vĩ độ và kinh độ');
        }
        return true;
    }),
];

const caveUpdateValidators = [
    param('id').isMongoId().withMessage('ID hang động không hợp lệ'),
    body('name.vi').optional().trim().notEmpty().withMessage('Tên hang động (VI) không được để trống'),
    body('name.en').optional().trim().notEmpty().withMessage('Tên hang động (EN) không được để trống'),
    body('location.lat').optional({ nullable: true }).isFloat({ min: -90, max: 90 }).withMessage('Vĩ độ phải trong khoảng -90 đến 90'),
    body('location.lng').optional({ nullable: true }).isFloat({ min: -180, max: 180 }).withMessage('Kinh độ phải trong khoảng -180 đến 180'),
    body('length').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Chiều dài không hợp lệ'),
    body('depth').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Độ sâu không hợp lệ'),
    body('heritageLevel').optional().isIn(['world', 'national', 'provincial', 'none']).withMessage('heritageLevel không hợp lệ'),
    body().custom((value) => {
        const hasLat = value?.location?.lat !== undefined && value?.location?.lat !== '';
        const hasLng = value?.location?.lng !== undefined && value?.location?.lng !== '';
        if (hasLat !== hasLng) {
            throw new Error('Cần nhập đầy đủ cả vĩ độ và kinh độ');
        }
        return true;
    }),
];

// Public routes - anyone can view caves
router.get('/', caveController.getAllCaves);
router.get('/:id', caveController.getCaveById);

// Admin only routes - create, update, delete caves
router.post('/', middleware.verifyAdmin, runValidation(caveCreateValidators), caveController.createCave);
router.put('/:id', middleware.verifyAdmin, runValidation(caveUpdateValidators), caveController.updateCave);
router.delete('/:id', middleware.verifyAdmin, caveController.deleteCave);

module.exports = router;
