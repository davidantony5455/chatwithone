const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store users in memory
const users = []; 
const onlineUsers = new Map();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Home route (IMPORTANT for Render)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Registration
app.post('/api/register', (req, res) => {
    const { name, age, gender, password } = req.body;

    if (!name || !age || !gender || !password) {
        return res.json({ success: false, message: 'All fields are required!' });
    }

    if (age < 13) {
        return res.json({ success: false, message: 'You must be at least 13 years old!' });
    }

    const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (existingUser) {
        return res.json({ success: false, message: 'Username already exists!' });
    }

    users.push({ name, age, gender, password });
    res.json({ success: true, message: 'Registration successful!' });
});

// Login
app.post('/api/login', (req, res) => {
    const { name, password } = req.body;

    const user = users.find(
        u => u.name.toLowerCase() === name.toLowerCase() && u.password === password
    );

    if (user) {
        res.json({ success: true, message: 'Login successful!' });
    } else {
        res.json({ success: false, message: 'Invalid username or password!' });
    }
});

// Get users
app.get('/api/users', (req, res) => {
    const userList = users.map(u => ({
        name: u.name,
        age: u.age,
        gender: u.gender
    }));
    res.json(userList);
});

// Online users
app.get('/api/online-users', (req, res) => {
    res.json(Array.from(onlineUsers.values()));
});

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-chat', (username) => {
        onlineUsers.set(socket.id, { name: username });
        io.emit('online-users', Array.from(onlineUsers.values()));
    });

    socket.on('private-message', ({ to, message, from }) => {
        for (const [socketId, user] of onlineUsers.entries()) {
            if (user.name === to) {
                io.to(socketId).emit('receive-message', { from, message });
                break;
            }
        }
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.id);
        io.emit('online-users', Array.from(onlineUsers.values()));
    });
});

// IMPORTANT for Render
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
