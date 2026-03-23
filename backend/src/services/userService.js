const User = require('../models/Users');

const userService = {
    getInfor: async (userId) => {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                const err = new Error('USER_NOT_FOUND');
                err.status = 404;
                throw err;
            }
            return user;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = userService;