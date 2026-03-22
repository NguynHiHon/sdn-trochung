const { io } = require('socket.io-client');
const http = require('http');

console.log('Starting end-to-end socket test...');
const socket = io('http://localhost:9999', { transports: ['websocket'] });

socket.on('connect', () => {
    console.log('Client connected. Registering admin 69b729545fa536bc1136e9e7...');
    socket.emit('register', { userId: '69b729545fa536bc1136e9e7', role: 'admin' });

    // Đợi 1s để register xong rồi trigger notification
    setTimeout(() => {
        console.log('Triggering /api/notifications/test-notify...');
        const req = http.request({
            hostname: 'localhost', port: 9999, path: '/api/notifications/test-notify', method: 'POST'
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => console.log('Trigger response:', data));
        });
        req.end();
    }, 1000);
});

socket.on('newNotification', (data) => {
    console.log('🔔 RECEIVED REAL-TIME NOTIFICATION 🔔');
    console.log(data);
    process.exit(0);
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('Timeout waiting for notification');
    process.exit(0);
}, 6000);
