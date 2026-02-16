// Check if user is logged in on chat page
if (window.location.pathname.includes('chat.html') || window.location.href.includes('chat.html')) {
    const currentUser = localStorage.getItem('chatwithone_user');
    if (!currentUser) {
        window.location.href = 'index.html';
    } else {
        document.getElementById('currentUser').textContent = currentUser;
        initializeChat();
    }
}

// Login Form Handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const messageEl = document.getElementById('loginMessage');
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('chatwithone_users') || '[]');
        
        // Find user
        const user = users.find(u => u.name.toLowerCase() === username.toLowerCase() && u.password === password);
        
        if (user) {
            localStorage.setItem('chatwithone_user', username);
            window.location.href = 'chat.html';
        } else {
            messageEl.textContent = 'Invalid username or password!';
            messageEl.className = 'message error';
        }
    });
}

// Register Form Handling
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const messageEl = document.getElementById('registerMessage');
        
        if (password !== confirmPassword) {
            messageEl.textContent = 'Passwords do not match!';
            messageEl.className = 'message error';
            return;
        }
        
        if (parseInt(age) < 13) {
            messageEl.textContent = 'You must be at least 13 years old!';
            messageEl.className = 'message error';
            return;
        }
        
        // Get existing users from localStorage
        const users = JSON.parse(localStorage.getItem('chatwithone_users') || '[]');
        
        // Check if user already exists
        const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
        if (existingUser) {
            messageEl.textContent = 'Username already exists!';
            messageEl.className = 'message error';
            return;
        }
        
        // Add new user
        users.push({ name, age, gender, password });
        localStorage.setItem('chatwithone_users', JSON.stringify(users));
        
        messageEl.textContent = 'Registration successful! Redirecting to login...';
        messageEl.className = 'message success';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// Chat Functionality
let selectedUser = null;
let currentUserName = localStorage.getItem('chatwithone_user');
let chatMessages = {};

function initializeChat() {
    loadAllUsers();
    
    // Setup message input
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function loadAllUsers() {
    const users = JSON.parse(localStorage.getItem('chatwithone_users') || '[]');
    const allUsersList = document.getElementById('allUsersList');
    const filteredUsers = users.filter(u => u.name !== currentUserName);
    
    if (filteredUsers.length === 0) {
        allUsersList.innerHTML = '<li>No registered users yet</li>';
    } else {
        allUsersList.innerHTML = filteredUsers.map(user => 
            `<li onclick="selectUser('${user.name}')">${user.name} (${user.gender}, ${user.age})</li>`
        ).join('');
    }
    
    // Update online users list (in this simple version, all registered users are considered "online")
    const userList = document.getElementById('userList');
    if (filteredUsers.length === 0) {
        userList.innerHTML = '<li>No other users online</li>';
    } else {
        userList.innerHTML = filteredUsers.map(user => 
            `<li onclick="selectUser('${user.name}')">${user.name}</li>`
        ).join('');
    }
}

function selectUser(username) {
    selectedUser = username;
    document.getElementById('chatHeader').textContent = `Chatting with ${username}`;
    
    // Enable chat input
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
    
    // Load previous messages
    loadMessages(username);
}

function loadMessages(withUser) {
    const messages = document.getElementById('messages');
    const messagesKey = `${currentUserName}_${withUser}`;
    const reverseKey = `${withUser}_${currentUserName}`;
    
    // Get messages from both directions
    const sentMessages = JSON.parse(localStorage.getItem('chatwithone_messages_' + messagesKey) || '[]');
    const receivedMessages = JSON.parse(localStorage.getItem('chatwithone_messages_' + reverseKey) || '[]');
    
    // Combine and sort messages
    const allMessages = [...sentMessages, ...receivedMessages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (allMessages.length === 0) {
        messages.innerHTML = `<div class="message-bubble received">
            <div class="sender">System</div>
            You are now chatting with ${withUser}. Start the conversation!
        </div>`;
    } else {
        messages.innerHTML = allMessages.map(msg => {
            const isSent = msg.from === currentUserName;
            return `<div class="message-bubble ${isSent ? 'sent' : 'received'}">
                ${!isSent ? `<div class="sender">${msg.from}</div>` : ''}
                ${msg.message}
                <div class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>`;
        }).join('');
    }
    
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message && selectedUser) {
        // Save message to localStorage
        const messagesKey = `${currentUserName}_${selectedUser}`;
        const messages = JSON.parse(localStorage.getItem('chatwithone_messages_' + messagesKey) || '[]');
        
        messages.push({
            from: currentUserName,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('chatwithone_messages_' + messagesKey, JSON.stringify(messages));
        
        // Add message to chat
        loadMessages(selectedUser);
        
        messageInput.value = '';
    }
}

function logout() {
    localStorage.removeItem('chatwithone_user');
    window.location.href = 'index.html';
}
