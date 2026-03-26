/**
 * socketService.js — Module quản lý Socket.IO tái sử dụng
 * Import và gọi emitToUser() từ bất kỳ service nào
 */

let io = null;

// Map userId -> Set of socketIds (1 user có thể mở nhiều tab)
const userSocketMap = new Map();

const init = (socketIoInstance) => {
    io = socketIoInstance;

    io.on('connection', (socket) => {
        // Client gửi userId (và role) sau khi authenticate
        socket.on('register', (data) => {
            console.log(`[Socket:register] Received raw data:`, data);
            const userId = typeof data === 'object' ? data.userId : data;
            const role = typeof data === 'object' ? data.role : null;
            const username = typeof data === 'object' ? data.username : null;

            if (!userId) {
                console.log(`[Socket:register] Missing userId.`);
                return;
            }

            socket.userId = userId;
            const roomName = `user_${userId}`;
            socket.join(roomName);
            console.log(`[Socket:register] Socket joined room: ${roomName}`);

            if (username) {
                const usernameRoom = `username_${String(username).toLowerCase()}`;
                socket.join(usernameRoom);
                console.log(`[Socket:register] Socket joined room: ${usernameRoom}`);
            }

            if (role === 'admin') {
                socket.join('role_admin');
                console.log(`[Socket:register] Socket joined room: role_admin`);
            } else if (role === 'staff') {
                socket.join('role_staff');
                console.log(`[Socket:register] Socket joined room: role_staff`);
            }

            if (!userSocketMap.has(userId)) {
                userSocketMap.set(userId, new Set());
            }
            userSocketMap.get(userId).add(socket.id);
            console.log(`[Socket:register] Finished -> User ${userId} (Role: ${role || 'unknown'}) connected (${socket.id})`);
        });

        // Tour room cho availability updates
        socket.on('joinTourRoom', (tourId) => {
            socket.join(`tour_${tourId}`);
        });

        socket.on('leaveTourRoom', (tourId) => {
            socket.leave(`tour_${tourId}`);
        });

        // Booking room cho trang thanh toán public (roomName = bookingCode)
        socket.on('join-booking-room', (bookingCode) => {
            if (!bookingCode) return;
            socket.join(String(bookingCode).trim().toUpperCase());
        });

        // Backward-compat với pattern từ dự án SEP
        socket.on('join-order-room', (code) => {
            if (!code) return;
            socket.join(String(code).trim().toUpperCase());
        });

        socket.on('disconnect', () => {
            if (socket.userId) {
                const sockets = userSocketMap.get(socket.userId);
                if (sockets) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) userSocketMap.delete(socket.userId);
                }
            }
        });
    });
};

/**
 * Gửi event tới 1 user cụ thể (qua room `user_<userId>`)
 */
const emitToUser = (userId, event, data) => {
    console.log(`[Socket:emitToUser] Attempting to emit '${event}' to user_${userId}`);
    if (!io) {
        console.log(`[Socket:emitToUser] Failed: io is null!`);
        return;
    }
    if (!userId) {
        console.log(`[Socket:emitToUser] Failed: userId is null!`);
        return;
    }
    const room = `user_${userId.toString()}`;
    io.to(room).emit(event, data);
    console.log(`[Socket:emitToUser] Successfully emitted '${event}' to room '${room}'`);
};

/**
 * Gửi event tới tất cả admin
 */
const emitToAdmins = (event, data) => {
    if (!io) return;
    io.to('role_admin').emit(event, data);
};

/**
 * Gửi event tới 1 tour room
 */
const emitToTourRoom = (tourId, event, data) => {
    if (!io) return;
    io.to(`tour_${tourId}`).emit(event, data);
};

/**
 * Emit event vào room = bookingCode (dùng cho trang payment/qr)
 */
const emitToBookingRoom = (bookingCode, event, data) => {
    if (!io || !bookingCode) return;
    io.to(String(bookingCode).trim().toUpperCase()).emit(event, data);
};

const getIO = () => io;

module.exports = { init, emitToUser, emitToAdmins, emitToTourRoom, emitToBookingRoom, getIO };
