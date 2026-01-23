const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URL) {
        console.error('url chưa được đặt hoặc đã sai đường dẫn url bạn vui lòng đặt lại đúng đường dẫn url');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URL, {

            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;