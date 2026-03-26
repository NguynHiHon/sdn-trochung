const express = require('express');
const userController = require('../controllers/userController');
const middleware = require('../middlewares/authMiddleWare');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

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

const userIdValidator = [param('id').isMongoId().withMessage('ID người dùng không hợp lệ')];
const createUserValidators = [
    body('username').trim().notEmpty().withMessage('username là bắt buộc').isLength({ min: 3 }).withMessage('username tối thiểu 3 ký tự'),
    body('password').isString().isLength({ min: 6 }).withMessage('password tối thiểu 6 ký tự'),
    body('role').optional().isIn(['admin', 'staff']).withMessage('role không hợp lệ'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('email không hợp lệ'),
];
const updateUserValidators = [
    ...userIdValidator,
    body('username').optional().trim().notEmpty().withMessage('username không được để trống').isLength({ min: 3 }).withMessage('username tối thiểu 3 ký tự'),
    body('role').optional().isIn(['admin', 'staff']).withMessage('role không hợp lệ'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('email không hợp lệ'),
    body('isActive').optional().isBoolean().withMessage('isActive không hợp lệ'),
];
const resetPasswordValidators = [
    ...userIdValidator,
    body('newPassword').isString().isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'),
];

// ── Public (auth required) ──
router.get('/me', middleware.verifyAccessToken, userController.getMe);

// ── Admin only ──
router.get('/all', middleware.verifyAdmin, userController.getAllUsers);
router.get('/staff-list', middleware.verifyAdmin, userController.getStaffList);
router.get('/:id', middleware.verifyAdmin, runValidation(userIdValidator), userController.getUserById);
router.post('/create', middleware.verifyAdmin, runValidation(createUserValidators), userController.createUser);
router.put('/:id', middleware.verifyAdmin, runValidation(updateUserValidators), userController.updateUser);
router.put('/:id/toggle-active', middleware.verifyAdmin, runValidation(userIdValidator), userController.toggleActive);
router.put('/:id/reset-password', middleware.verifyAdmin, runValidation(resetPasswordValidators), userController.resetPassword);
router.delete('/:id', middleware.verifyAdmin, runValidation(userIdValidator), userController.deleteUser);

module.exports = router;