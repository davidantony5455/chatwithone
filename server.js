const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store users in memory (in production, use a database)
const users = []; // { name, age, gender, password }
const onlineUsers = new Map(); // socket.id -> { name }

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Registration endpoint
app.post('/api/register', (req, res) => {
    const { name, age, gender, password } = req.body;
    
    // Validation
    if (!name || !age || !gender || !password) {
        return res.json({ success: false, message: 'All fields are required!' });
    }
    
    if (age < 13) {
        return res.json({ success: false, message: 'You must be at least 13 years old!' });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (existingUser) {
        return res.json({ success: false, message: 'Username already exists!' });
    }
    
    // Add new user
    users.push({ name, age, gender, password });
    res.json({ success: true, message: 'Registration successful! Please login.' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { name, password } = req.body;
    
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);
    
    if (user) {
        res.json({ success: true, message: 'Login successful!' });
    } else {
        res.json({ success: false, message: 'Invalid username or password!' });
    }
});

// Get all registered users
app.get('/api/users', (req, res) => {
    const userList = users.map(u => ({ name: u.name, age: u.age, gender: u.gender }));
    res.json(userList);
});

// Get online users
app.get('/api/online-users', (req, res) => {
    const online = Array.from(onlineUsers.values());
    res.json(online);
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // User joins chat
    socket.on('join-chat', (username) => {
        onlineUsers.set(socket.id, { name: username });
        io.emit('user-joined', username);
        io.emit('online-users', Array.from(onlineUsers.values()));
    });
    
    // Send private message
    socket.on('private-message', ({ to, message, from }) => {
        // Find the socket ID of the recipient
        for (const [socketId, user] of onlineUsers.entries()) {
            if (user.name === to) {
                io.to(socketId).emit('receive-message', { from, message });
                break;
            }
        }
    });
    
    // User disconnects
    socket.on('disconnect', () => {
        const user = onlineUsers.get(socket.id);
        if (user) {
            onlineUsers.delete(socket.id);
            io.emit('user-left', user.name);
            io.emit('online-users', Array.from(onlineUsers.values()));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
