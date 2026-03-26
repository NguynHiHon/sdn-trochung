const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
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

const mediaCreateValidators = [
    body('name').trim().notEmpty().withMessage('Tên ảnh là bắt buộc'),
    body('url').trim().notEmpty().withMessage('URL ảnh là bắt buộc').isURL().withMessage('URL ảnh không hợp lệ'),
    body('type').optional().isIn(['tour', 'gallery', 'banner', 'other']).withMessage('Loại ảnh không hợp lệ'),
    body('title').optional().isString().withMessage('Tiêu đề ảnh không hợp lệ'),
];

const mediaUpdateValidators = [
    param('id').isMongoId().withMessage('ID ảnh không hợp lệ'),
    body('name').optional().trim().notEmpty().withMessage('Tên ảnh không được để trống'),
    body('url').optional().trim().notEmpty().withMessage('URL ảnh không được để trống').isURL().withMessage('URL ảnh không hợp lệ'),
    body('type').optional().isIn(['tour', 'gallery', 'banner', 'other']).withMessage('Loại ảnh không hợp lệ'),
    body('title').optional().isString().withMessage('Tiêu đề ảnh không hợp lệ'),
];

// Public routes - anyone can view media
router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);

// Admin only routes - create, update, delete media
router.post('/', middleware.verifyAdmin, runValidation(mediaCreateValidators), mediaController.createMedia);
router.put('/:id', middleware.verifyAdmin, runValidation(mediaUpdateValidators), mediaController.updateMedia);
router.delete('/:id', middleware.verifyAdmin, mediaController.deleteMedia);

module.exports = router;
