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

            if (!userId) {
                console.log(`[Socket:register] Missing userId.`);
                return;
            }

            socket.userId = userId;
            const roomName = `user_${userId}`;
            socket.join(roomName);
            console.log(`[Socket:register] Socket joined room: ${roomName}`);

            if (role === 'admin') {
                socket.join('role_admin');
                console.log(`[Socket:register] Socket joined room: role_admin`);
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

const getIO = () => io;

module.exports = { init, emitToUser, emitToAdmins, emitToTourRoom, getIO };
