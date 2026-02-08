// ============================================
// Configuration
// ============================================
const API_BASE_URL = 'http://localhost:8001';

// ============================================
// DOM Elements
// ============================================
const chatContainer = document.getElementById('chatContainer');
const recommendationsContainer = document.getElementById('recommendationsContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const locationSelect = document.getElementById('location');
const movieSearchInput = document.getElementById('movieSearchInput');
const availabilityResults = document.getElementById('availabilityResults');

// ============================================
// State
// ============================================
let isFirstMessage = true;
let currentTab = 'recommend';

// ============================================
// Event Listeners
// ============================================
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

movieSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkAvailability();
    }
});

// ============================================
// Tab Switching
// ============================================
function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'recommend') {
        document.getElementById('recommendTab').classList.add('active');
        document.getElementById('recommendInputArea').style.display = 'block';
    } else {
        document.getElementById('availabilityTab').classList.add('active');
        document.getElementById('recommendInputArea').style.display = 'none';
    }
}

// ============================================
// Availability Check
// ============================================
async function checkAvailability() {
    const query = movieSearchInput.value.trim();

    if (!query) return;

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayAvailabilityResults(data);

    } catch (error) {
        console.error('Error:', error);
        availabilityResults.innerHTML = `
            <div class="error-message">
                Unable to check availability. Please make sure the backend is running.
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

function displayAvailabilityResults(data) {
    if (!data.results || data.results.length === 0) {
        availabilityResults.innerHTML = `
            <div class="availability-card no-results">
                <div class="no-availability">
                    <span class="sad-icon">😔</span>
                    <p>No movies or TV shows found matching your search.</p>
                </div>
            </div>
        `;
        return;
    }

    let html = '';

    for (const item of data.results) {
        const typeIcon = item.type === 'TV Show' ? '📺' : '🎬';
        const typeBadge = item.type === 'TV Show' ? 'tv-show' : 'movie';

        let seasonsHtml = '';
        if (item.seasons && item.seasons.length > 0) {
            seasonsHtml = `
                <div class="seasons-info">
                    <span class="seasons-badge">📅 ${item.total_seasons} Season(s)</span>
                    <div class="seasons-list">
                        ${item.seasons.map(s => `
                            <span class="season-tag">${s.name} (${s.episode_count} eps)</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        let regionsHtml = '';
        if (item.total_regions === 0) {
            regionsHtml = `
                <div class="no-availability-small">
                    <p>Not available on Netflix or Prime Video in tracked regions</p>
                </div>
            `;
        } else {
            for (const [code, info] of Object.entries(item.availability)) {
                const platformBadges = info.platforms.map(p => {
                    const badgeClass = p.toLowerCase().includes('netflix') ? 'netflix' : 'prime';
                    return `<span class="platform-badge ${badgeClass}">${escapeHtml(p)}</span>`;
                }).join('');

                regionsHtml += `
                    <div class="region-item">
                        <span class="region-flag">${getCountryFlag(code)}</span>
                        <span class="region-name">${escapeHtml(info.country)}</span>
                        <div class="region-platforms">${platformBadges}</div>
                    </div>
                `;
            }
        }

        html += `
            <div class="availability-card">
                <div class="content-header">
                    <span class="type-icon">${typeIcon}</span>
                    <div class="content-info">
                        <h3>${escapeHtml(item.title)}</h3>
                        <span class="type-badge ${typeBadge}">${item.type}</span>
                    </div>
                </div>
                <p class="movie-overview">${escapeHtml(item.overview)}</p>
                ${seasonsHtml}
                <div class="availability-summary">
                    <span class="region-count">🌍 Available in ${item.total_regions} region(s)</span>
                </div>
                <div class="regions-list">
                    ${regionsHtml}
                </div>
            </div>
        `;
    }

    availabilityResults.innerHTML = html;
}

function getCountryFlag(code) {
    const flags = {
        'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'IN': '🇮🇳',
        'PK': '🇵🇰', 'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷',
        'JP': '🇯🇵', 'BR': '🇧🇷'
    };
    return flags[code] || '🌐';
}

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
 * Format AI response - clean up markdown formatting
 */
function formatAIResponse(text) {
    // Remove ** bold markers (non-greedy)
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');

    // Remove * italic markers
    text = text.replace(/\*([^*]+)\*/g, '$1');

    // Convert bullet points (* at start of line) to clean bullets
    text = text.replace(/^\s*[\*\-]\s+/gm, '\n• ');

    // Remove any remaining standalone asterisks
    text = text.replace(/\s\*\s/g, ' ');

    // Clean up multiple newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace
    text = text.trim();

    return text;
}

/**
 * Add a message to the chat container
 */
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatar = type === 'user' ? '👤' : '🤖';

    // Format AI responses to remove markdown
    const displayText = type === 'ai' ? formatAIResponse(text) : text;

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-bubble">
            <p class="message-text">${escapeHtml(displayText).replace(/\n/g, '<br>')}</p>
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
