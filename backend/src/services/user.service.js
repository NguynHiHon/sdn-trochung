const User = require('../models/Users');
const bcrypt = require('bcrypt');

const getAllUsers = async ({ role, isActive, page = 1, limit = 20, search }) => {
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (isActive !== undefined && isActive !== 'all') filter.isActive = isActive === 'true' || isActive === true;
    if (search) {
        filter.$or = [
            { username: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
        User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(filter),
    ]);

    return { data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
};

const getUserById = async (id) => {
    return await User.findById(id).select('-password');
};

const createUser = async ({ username, password, role, fullName, email, phone }) => {
    const exists = await User.findOne({ username: username.toLowerCase().trim() });
    if (exists) throw new Error('Tên đăng nhập đã tồn tại');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return await User.create({
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        role: role || 'staff',
        fullName: fullName || '',
        email: email || '',
        phone: phone || '',
    });
};

const updateUser = async (id, updateData) => {
    // Never allow password update through this function
    const { password, ...safeData } = updateData;
    return await User.findByIdAndUpdate(id, safeData, { new: true }).select('-password');
};

const toggleActive = async (id) => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    user.isActive = !user.isActive;
    await user.save();
    return { _id: user._id, isActive: user.isActive };
};

const resetPassword = async (id, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    return await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).select('-password');
};

const deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
};

const getStaffList = async () => {
    return await User.find({ role: 'staff', isActive: true }).select('_id username fullName email phone');
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, toggleActive, resetPassword, deleteUser, getStaffList };
