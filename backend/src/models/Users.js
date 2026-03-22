const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff'
    },
    fullName: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Index for quick lookup
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);