// ============================================
// Configuration
// ============================================
const API_BASE_URL = 'http://localhost:8000';

// ============================================
// DOM Elements
// ============================================
const chatContainer = document.getElementById('chatContainer');
const recommendationsContainer = document.getElementById('recommendationsContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const locationSelect = document.getElementById('location');

// ============================================
// State
// ============================================
let isFirstMessage = true;

// ============================================
// Event Listeners
// ============================================
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// ============================================
// Main Functions
// ============================================

/**
 * Send a suggestion chip message
 */
function sendSuggestion(text) {
    messageInput.value = text;
    sendMessage();
}

/**
 * Send message to the API
 */
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    messageInput.value = '';
    
    // Remove welcome message on first interaction
    if (isFirstMessage) {
        const welcomeMessage = chatContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        isFirstMessage = false;
    }
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Show loading
    showLoading(true);
    disableInput(true);
    
    try {
        const location = locationSelect.value;
        
        const response = await fetch(`${API_BASE_URL}/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                location: location
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add AI response
        addMessage(data.reply, 'ai');
        
        // Display recommendations
        if (data.recommendations && data.recommendations.length > 0) {
            displayRecommendations(data.recommendations);
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('Unable to connect to the server. Please make sure the backend is running.');
    } finally {
        showLoading(false);
        disableInput(false);
        messageInput.focus();
    }
}

/**
 * Add a message to the chat container
 */
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const avatar = type === 'user' ? '👤' : '🤖';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-bubble">
            <p class="message-text">${escapeHtml(text)}</p>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Display movie recommendations
 */
function displayRecommendations(recommendations) {
    recommendationsContainer.innerHTML = '<h3>Recommendations</h3>';
    
    recommendations.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        recommendationsContainer.appendChild(card);
    });
    
    recommendationsContainer.classList.add('visible');
}

/**
 * Create a movie card element
 */
function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Generate platform badges
    const platformBadges = generatePlatformBadges(movie.platforms || movie.platform || []);
    
    card.innerHTML = `
        <div class="movie-card-content">
            <h4 class="movie-title">${escapeHtml(movie.title)}</h4>
            <p class="movie-overview">${escapeHtml(movie.overview || '')}</p>
            <div class="movie-platforms">
                ${platformBadges}
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Generate platform badges HTML
 */
function generatePlatformBadges(platforms) {
    if (!platforms || platforms.length === 0) {
        return '<span class="platform-badge other">Streaming info unavailable</span>';
    }
    
    return platforms.map(platform => {
        const platformLower = platform.toLowerCase();
        let badgeClass = 'other';
        
        if (platformLower.includes('netflix')) {
            badgeClass = 'netflix';
        } else if (platformLower.includes('prime') || platformLower.includes('amazon')) {
            badgeClass = 'prime';
        }
        
        return `<span class="platform-badge ${badgeClass}">${escapeHtml(platform)}</span>`;
    }).join('');
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    chatContainer.appendChild(errorDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('visible');
    } else {
        loadingOverlay.classList.remove('visible');
    }
}

/**
 * Enable/disable input
 */
function disableInput(disabled) {
    messageInput.disabled = disabled;
    sendButton.disabled = disabled;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    messageInput.focus();
});
