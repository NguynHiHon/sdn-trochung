const express = require('express');
const userController = require('../controllers/userController');
const middleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ── Public (auth required) ──
router.get('/me', middleware.verifyAccessToken, userController.getMe);

// ── Admin only ──
router.get('/all', middleware.verifyAdmin, userController.getAllUsers);
router.get('/staff-list', middleware.verifyAdmin, userController.getStaffList);
router.get('/:id', middleware.verifyAdmin, userController.getUserById);
router.post('/create', middleware.verifyAdmin, userController.createUser);
router.put('/:id', middleware.verifyAdmin, userController.updateUser);
router.put('/:id/toggle-active', middleware.verifyAdmin, userController.toggleActive);
router.put('/:id/reset-password', middleware.verifyAdmin, userController.resetPassword);
router.delete('/:id', middleware.verifyAdmin, userController.deleteUser);

module.exports = router;