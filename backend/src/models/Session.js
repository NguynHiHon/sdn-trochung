
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true
    },
    expireAt: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

sessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model('Session', sessionSchema); 