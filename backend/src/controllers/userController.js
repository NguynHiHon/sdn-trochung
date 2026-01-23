
const userService = require('../services/userService');

const userController = {

    getMe: async (req, res) => {
        try {
            const user = req.user;
            const userInfo = await userService.getInfor(user.id);
            return res.status(200).json({ message: 'Lấy thông tin người dùng thành công', userInfo });
        } catch (error) {
            const status = error.status || 500;
            let message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({
                message,
            });
        }
    }
}
module.exports = userController;