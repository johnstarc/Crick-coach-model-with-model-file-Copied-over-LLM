// Chat Application JavaScript
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const charCount = document.getElementById('charCount');

const MAX_CHARS = 1000;
let isWaitingForResponse = false;

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';

    // Update character count
    const count = this.value.length;
    charCount.textContent = `${count}/${MAX_CHARS}`;

    if (count > MAX_CHARS) {
        charCount.style.color = '#c41e3a';
        this.value = this.value.substring(0, MAX_CHARS);
    } else {
        charCount.style.color = '#6c757d';
    }
});

// Handle keyboard shortcuts
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Send quick message from buttons
function sendQuickMessage(message) {
    messageInput.value = message;
    sendMessage();
}

// Get current time string
function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Create user message element
function createUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <div class="user-avatar">👤</div>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="sender-name">You</span>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
            <div class="message-text">
                <p>${escapeHtml(text)}</p>
            </div>
        </div>
    `;
    return messageDiv;
}

// Create coach message element
function createCoachMessage(text, isStreaming = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message coach-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <div class="coach-avatar">🏏</div>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="sender-name">Coach</span>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
            <div class="message-text">
                ${isStreaming ? '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>' : formatMessage(text)}
            </div>
        </div>
    `;
    return messageDiv;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format message with markdown-like styling
function formatMessage(text) {
    if (!text) return '';

    let formatted = escapeHtml(text);

    // Bold text **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic text *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Numbered lists
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Line breaks
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already
    if (!formatted.startsWith('<')) {
        formatted = `<p>${formatted}</p>`;
    }

    return formatted;
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message to backend
async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message || isWaitingForResponse) return;

    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    charCount.textContent = '0/1000';

    // Add user message
    chatMessages.appendChild(createUserMessage(message));
    scrollToBottom();

    // Create coach message with typing indicator
    const coachMessageDiv = createCoachMessage('', true);
    chatMessages.appendChild(coachMessageDiv);
    scrollToBottom();

    // Disable input while waiting
    isWaitingForResponse = true;
    sendBtn.disabled = true;
    messageInput.disabled = true;

    try {
        // Use streaming endpoint
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        const messageTextDiv = coachMessageDiv.querySelector('.message-text');

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;

            // Update message content
            messageTextDiv.innerHTML = formatMessage(fullResponse);
            scrollToBottom();
        }

        // If no response received, show error
        if (!fullResponse.trim()) {
            messageTextDiv.innerHTML = formatMessage("I apologize, but I couldn't generate a response. Please make sure Ollama is running with the cricket-coach model.");
        }

    } catch (error) {
        console.error('Error:', error);
        const messageTextDiv = coachMessageDiv.querySelector('.message-text');
        messageTextDiv.innerHTML = formatMessage("Sorry, I'm having trouble connecting to the server. Please ensure:\n\n1. **Ollama is running** on your machine\n2. The **cricket-coach** model is loaded\n3. The backend server is running\n\nTry running: `ollama run cricket-coach`");
    } finally {
        // Re-enable input
        isWaitingForResponse = false;
        sendBtn.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
        scrollToBottom();
    }
}
