const userService = require('../services/userService');
const userCrudService = require('../services/user.service');

const userController = {
    // ── Existing: get current user info ──
    getMe: async (req, res) => {
        try {
            const user = req.user;
            const userInfo = await userService.getInfor(user.id);
            return res.status(200).json({ success: true, message: 'OK', userInfo });
        } catch (error) {
            const status = error.status || 500;
            return res.status(status).json({ success: false, message: error.message });
        }
    },

    // ── Admin: list all users ──
    getAllUsers: async (req, res) => {
        try {
            const result = await userCrudService.getAllUsers(req.query);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ── Admin: get user by ID ──
    getUserById: async (req, res) => {
        try {
            const user = await userCrudService.getUserById(req.params.id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ── Admin: create account ──
    createUser: async (req, res) => {
        try {
            const user = await userCrudService.createUser(req.body);
            res.status(201).json({ success: true, data: { _id: user._id, username: user.username, role: user.role, fullName: user.fullName }, message: 'Tạo tài khoản thành công' });
        } catch (error) {
            if (error?.code === 11000 || error.message.includes('tồn tại')) {
                return res.status(409).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ── Admin: update user ──
    updateUser: async (req, res) => {
        try {
            const user = await userCrudService.updateUser(req.params.id, req.body);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            res.status(200).json({ success: true, data: user, message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ── Admin: ban/unban ──
    toggleActive: async (req, res) => {
        try {
            const result = await userCrudService.toggleActive(req.params.id);
            res.status(200).json({ success: true, data: result, message: result.isActive ? 'Đã mở khoá tài khoản' : 'Đã khoá tài khoản' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ── Admin: reset password ──
    resetPassword: async (req, res) => {
        try {
            await userCrudService.resetPassword(req.params.id, req.body.newPassword);
            res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ── Admin: delete user ──
    deleteUser: async (req, res) => {
        try {
            await userCrudService.deleteUser(req.params.id);
            res.status(200).json({ success: true, message: 'Đã xoá tài khoản' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ── Get staff list (for assignment dropdown) ──
    getStaffList: async (req, res) => {
        try {
            const staff = await userCrudService.getStaffList();
            res.status(200).json({ success: true, data: staff });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

module.exports = userController;