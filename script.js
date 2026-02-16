// DOM Elements
const landingPage = document.getElementById('landing-page');
const chatPage = document.getElementById('chat-page');
const startChatBtn = document.getElementById('start-chat-btn');
const newStrangerBtn = document.getElementById('new-stranger-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const chatStatus = document.getElementById('chat-status');

// State
let isConnected = false;
let strangerTyping = false;

// Sample responses for simulation
const strangerResponses = [
    "Hello! How are you doing?",
    "That's interesting! Tell me more.",
    "I'm from a different country, what about you?",
    "Wow, that's really cool!",
    "What do you do for fun?",
    "That's a great point!",
    "I agree with you on that.",
    "That's so funny! 😄",
    "Really? That's amazing!",
    "What else do you like to do?",
    "I've never thought of it that way!",
    "Thanks for sharing that with me!",
    "That's really interesting!",
    "Where are you from?",
    "Have you traveled much?"
];

// Event Listeners
startChatBtn.addEventListener('click', startChat);
newStrangerBtn.addEventListener('click', findNewStranger);
disconnectBtn.addEventListener('click', disconnect);
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Functions
function startChat() {
    landingPage.classList.remove('active');
    chatPage.classList.add('active');
    
    // Simulate connecting to a stranger
    chatStatus.textContent = 'Connecting to stranger...';
    messageInput.disabled = true;
    sendBtn.disabled = true;
    
    setTimeout(() => {
        connectToStranger();
    }, 1500);
}

function connectToStranger() {
    isConnected = true;
    chatStatus.textContent = 'Stranger is online';
    
    // Enable input
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
    
    // Add system message
    addMessage('system', 'You are now connected with a stranger. Say hello!');
    
    // Stranger sends first message after a delay
    setTimeout(() => {
        if (isConnected) {
            const responses = [
                "Hey there! 👋",
                "Hi! Nice to meet you!",
                "Hello! How's it going?",
                "Hey! What's up?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage('stranger', randomResponse);
        }
    }, 2000);
}

function findNewStranger() {
    // Clear chat
    chatMessages.innerHTML = '';
    
    // Add system message
    addMessage('system', 'Looking for a new stranger...');
    
    // Disable input
    messageInput.disabled = true;
    sendBtn.disabled = true;
    chatStatus.textContent = 'Finding new stranger...';
    
    // Simulate finding new stranger
    setTimeout(() => {
        connectToStranger();
    }, 2000);
}

function disconnect() {
    isConnected = false;
    
    // Clear chat
    chatMessages.innerHTML = '';
    
    // Add system message
    addMessage('system', 'You have disconnected from the chat.');
    
    // Disable input
    messageInput.disabled = true;
    sendBtn.disabled = true;
    chatStatus.textContent = 'Disconnected';
    
    // Go back to landing page after delay
    setTimeout(() => {
        chatPage.classList.remove('active');
        landingPage.classList.add('active');
    }, 2000);
}

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message || !isConnected) return;
    
    // Add user's message
    addMessage('user', message);
    
    // Clear input
    messageInput.value = '';
    
    // Simulate stranger response
    setTimeout(() => {
        if (isConnected) {
            showTypingIndicator();
            
            setTimeout(() => {
                hideTypingIndicator();
                const randomResponse = strangerResponses[Math.floor(Math.random() * strangerResponses.length)];
                addMessage('stranger', randomResponse);
            }, 1500 + Math.random() * 1500);
        }
    }, 500);
}

function addMessage(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    
    const time = new Date();
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (type === 'system') {
        messageDiv.textContent = text;
    } else {
        messageDiv.innerHTML = `
            ${text}
            <span class="time">${timeString}</span>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'stranger', 'typing');
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<span>•••</span>';
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}
