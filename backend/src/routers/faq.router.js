const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faq.controller');
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

const categoryCreateValidators = [
    body('slug').trim().notEmpty().withMessage('slug nhóm FAQ là bắt buộc'),
    body('title.vi').trim().notEmpty().withMessage('Tiêu đề nhóm (VI) là bắt buộc'),
    body('title.en').trim().notEmpty().withMessage('Tiêu đề nhóm (EN) là bắt buộc'),
    body('heroImage').optional({ checkFalsy: true }).isMongoId().withMessage('heroImage không hợp lệ'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder không hợp lệ'),
];

const categoryUpdateValidators = [
    param('id').isMongoId().withMessage('ID nhóm FAQ không hợp lệ'),
    body('slug').optional().trim().notEmpty().withMessage('slug nhóm FAQ không được để trống'),
    body('title.vi').optional().trim().notEmpty().withMessage('Tiêu đề nhóm (VI) không được để trống'),
    body('title.en').optional().trim().notEmpty().withMessage('Tiêu đề nhóm (EN) không được để trống'),
    body('heroImage').optional({ checkFalsy: true }).isMongoId().withMessage('heroImage không hợp lệ'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder không hợp lệ'),
];

const itemCreateValidators = [
    body('categoryId').isMongoId().withMessage('categoryId không hợp lệ'),
    body('question.vi').trim().notEmpty().withMessage('Câu hỏi (VI) là bắt buộc'),
    body('question.en').trim().notEmpty().withMessage('Câu hỏi (EN) là bắt buộc'),
    body('answer.vi').trim().notEmpty().withMessage('Câu trả lời (VI) là bắt buộc'),
    body('answer.en').trim().notEmpty().withMessage('Câu trả lời (EN) là bắt buộc'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder không hợp lệ'),
];

const itemUpdateValidators = [
    param('id').isMongoId().withMessage('ID câu hỏi FAQ không hợp lệ'),
    body('categoryId').optional().isMongoId().withMessage('categoryId không hợp lệ'),
    body('question.vi').optional().trim().notEmpty().withMessage('Câu hỏi (VI) không được để trống'),
    body('question.en').optional().trim().notEmpty().withMessage('Câu hỏi (EN) không được để trống'),
    body('answer.vi').optional().trim().notEmpty().withMessage('Câu trả lời (VI) không được để trống'),
    body('answer.en').optional().trim().notEmpty().withMessage('Câu trả lời (EN) không được để trống'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder không hợp lệ'),
];

router.get('/', ctrl.getPublicTree);

router.get('/admin/categories', middleware.verifyAdminOrStaff, ctrl.listCategories);
router.post('/admin/categories', middleware.verifyAdminOrStaff, runValidation(categoryCreateValidators), ctrl.createCategory);
router.put('/admin/categories/:id', middleware.verifyAdminOrStaff, runValidation(categoryUpdateValidators), ctrl.updateCategory);
router.delete('/admin/categories/:id', middleware.verifyAdminOrStaff, runValidation([param('id').isMongoId().withMessage('ID nhóm FAQ không hợp lệ')]), ctrl.deleteCategory);

router.get('/admin/items', middleware.verifyAdminOrStaff, ctrl.listItems);
router.post('/admin/items', middleware.verifyAdminOrStaff, runValidation(itemCreateValidators), ctrl.createItem);
router.put('/admin/items/:id', middleware.verifyAdminOrStaff, runValidation(itemUpdateValidators), ctrl.updateItem);
router.delete('/admin/items/:id', middleware.verifyAdminOrStaff, runValidation([param('id').isMongoId().withMessage('ID câu hỏi FAQ không hợp lệ')]), ctrl.deleteItem);

module.exports = router;
