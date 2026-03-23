/**
 * socketClient.js — Singleton Socket.IO client
 * Import getSocket() từ bất kỳ component nào để dùng chung 1 connection.
 */
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:9999';

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: false,
            withCredentials: true,
        });
    }
    return socket;
};

/**
 * Kết nối + đăng ký user với server
 * @param {string} userId
 * @param {string} role - 'admin' | 'staff'
 */
export const connectSocket = (userId, role) => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    s.once('connect', () => {
        s.emit('register', { userId, role });
    });
    // Nếu đã connect rồi thì emit ngay
    if (s.connected) {
        s.emit('register', { userId, role });
    }
    return s;
};

/**
 * Ngắt kết nối socket
 */
export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};
