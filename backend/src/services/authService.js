
const bcrypt = require('bcrypt');
const User = require('../models/users');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');

const checkPasswordStrength = (password) => {
    // Kiểm tra độ dài tối thiểu
    if (password.length < 8) {
        return false;
    }
    // Kiểm tra có chứa chữ hoa, chữ thường, số 
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers;

}
const ReToken_TTL = 30 * 24 * 60 * 60 * 1000;
const AccessToken_TTL = 30 * 1000;
const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: AccessToken_TTL });
}

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: ReToken_TTL });
}


const authService = {
    signUp: async (username, password) => {
        try {
            if (!username || !password) {
                const err = new Error('INVALID_INPUT');
                err.status = 400;
                throw err;
            }
            //chuẩn hóa username lần 1 vì đã có trim và lowercase trong schema nhưng để chắc chắn
            username = String(username).trim().toLowerCase();
            // kiểm tra mật khẩu đủ mạnh và đạt yêu cầu
            if (typeof password !== 'string' || !checkPasswordStrength(password)) {
                const err = new Error('WEAK_PASSWORD');
                err.status = 400;
                throw err;
            }

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                const err = new Error('EXISTS');
                err.status = 409;
                throw err;
            }

            const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(password, rounds);
            const newUser = await User.create({ username, password: hashedPassword });

            const { password: userPassword, ...userWithoutPassword } = newUser._doc;

            return userWithoutPassword;
        } catch (error) {
            // rethrow so controller can handle
            throw error;
        }
    },

    signIn: async (username, password) => {
        try {
            if (!username || !password) {
                const err = new Error('INVALID_INPUT');
                err.status = 400;
                throw err;
            }
            //chuẩn hóa username lần 1 
            username = String(username).trim().toLowerCase();
            const user = await User.findOne({ username });
            if (!user) {
                const err = new Error('USER_NOT_FOUND');
                err.status = 404;
                throw err;
            }
            const passIsCorrect = await bcrypt.compare(password, user.password);
            if (!passIsCorrect) {
                const err = new Error('WRONG_PASSWORD');
                err.status = 401;
                throw err;
            }

            const refreshToken = generateRefreshToken(user);
            const accessToken = generateAccessToken(user);

            // Create new session for this user
            const newSession = await Session.create({
                userId: user._id,
                refreshToken: refreshToken,
                expireAt: new Date(Date.now() + ReToken_TTL) // 30 days
            });

            // Enforce maximum number of sessions per user (keep most recent N)
            const MAX_SESSIONS = parseInt(process.env.MAX_SESSIONS) || 3;
            const sessions = await Session.find({ userId: user._id }).sort({ createdAt: -1 }); // newest first
            if (sessions.length > MAX_SESSIONS) {
                const idsToRemove = sessions.slice(MAX_SESSIONS).map(s => s._id);
                await Session.deleteMany({ _id: { $in: idsToRemove } });
            }


            const { password: userPassword, ...userWithoutPassword } = user._doc; // eslint-disable-line no-unused-vars

            const userWithTokens = { // khởi tạo đối tượng user trả về, bao gồm accessToken
                ...userWithoutPassword,
                accessToken,

            };
            return { user: userWithTokens, refreshToken };

        } catch (error) {
            throw error;
        }
    },
    signOut: async (refreshToken) => {
        try {
            await Session.findOneAndDelete({ refreshToken });
        } catch (error) {
            throw error;
        }
    },

    // Refresh Access Token
    refreshAccessToken: async (refreshToken) => {
        try {
            if (!refreshToken) {
                const err = new Error('REFRESH_TOKEN_REQUIRED');
                err.status = 401;
                throw err;
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

            // Check if session exists in database
            const session = await Session.findOne({ refreshToken, userId: decoded.id });
            if (!session) {
                const err = new Error('INVALID_SESSION');
                err.status = 401;
                throw err;
            }

            // Check if session is expired
            if (session.expireAt < new Date()) {
                await Session.deleteOne({ _id: session._id });
                const err = new Error('SESSION_EXPIRED');
                err.status = 401;
                throw err;
            }

            // Get user info
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                const err = new Error('USER_NOT_FOUND');
                err.status = 404;
                throw err;
            }

            // Generate new access token
            const newAccessToken = generateAccessToken(user);

            return { accessToken: newAccessToken, user };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = authService;
