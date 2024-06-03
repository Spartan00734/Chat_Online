const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sanitizeHtml = require('sanitize-html');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 4000;

const colors = ['#000000', '#FF0000', '#0000FF', '#008000', '#A52A2A', '#FFA500', '#800080', '#EE82EE'];
let users = [];
let messages = [];
let assignedColors = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('request color', (username) => {
        let availableColor = getAvailableColor();
        assignedColors[socket.id] = availableColor;
        socket.emit('assign color', availableColor);
    });

    socket.on('set username', (data) => {
        const user = { id: socket.id, username: data.username, color: assignedColors[socket.id] };
        users.push(user);
        socket.emit('previous messages', messages);
        io.emit('user joined', { username: data.username, users });
    });

    socket.on('disconnect', () => {
        const user = users.find(u => u.id === socket.id);
        if (user) {
            users = users.filter(u => u.id !== socket.id);
            delete assignedColors[socket.id];
            io.emit('user left', { username: user.username, users });
        }
        console.log('A user disconnected');
    });

    socket.on('chat message', (msg) => {
        const user = users.find(u => u.id === socket.id);
        if (user) {
            const sanitizedMessage = sanitizeHtml(msg);
            const messageData = { username: user.username, message: sanitizedMessage, userColor: user.color };
            messages.push(messageData);
            io.emit('chat message', messageData);
        }
    });

    function getAvailableColor() {
        const usedColors = Object.values(assignedColors);
        const availableColors = colors.filter(color => !usedColors.includes(color));

        if (availableColors.length > 0) {
            return availableColors[0];
        } else {
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
