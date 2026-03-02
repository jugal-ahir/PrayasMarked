let io;

module.exports = {
    init: (server) => {
        const { Server } = require('socket.io');
        io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            socket.on('disconnect', () => console.log('Client disconnected'));
        });

        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    }
};
