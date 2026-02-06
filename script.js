// ============================================
// KURUKSHETRA INFOBOT - Main JavaScript File
// ============================================

// CONFIGURATION
const N8N_WEBHOOK_URL = "https://n8n-workflow-test.duckdns.org/webhook/chat";
const FEEDBACK_WEBHOOK_URL = "https://n8n-workflow-test.duckdns.org/webhook/Feed";
const GITA_WEBHOOK_URL = "https://n8n-workflow-test.duckdns.org/webhook/InfoBot_AskGita";

// GLOBAL STATE
let currentLanguage = localStorage.getItem('preferred_language') || 'en';
let currentSetIndex = 0;
let rotationInterval;
let messages = JSON.parse(localStorage.getItem('kwr_chat_history')) || [];
let autocompleteData = { en: [], hi: [] };

// TRANSLATIONS
const translations = {
    en: {
        title: "Kurukshetra InfoBot",
        subtitle: "Powered by AI • 24/7 Available",
        officialInfo: "Official Information",
        officialDesc: "All responses are sourced from",
        welcomeTitle: "Namaste!",
        welcomeText: "I'm your AI assistant for Kurukshetra district. Ask me about:",
        welcomeOfficers: "Officers & Departments",
        welcomeTourist: "Tourist Places & Heritage",
        welcomeServices: "Services & Schemes",
        welcomeDistrict: "District Information",
        welcomeEmergency: "Emergency Contacts",
        welcomeSuggestion: "Try the suggestions below to get started!",
        inputPlaceholder: "Ask me anything about Kurukshetra...",
        clearChat: "Clear chat",
        visitWebsite: "Visit Website",
        suggestions: "Suggestions",
        typing: "Typing...",
        menuFeedback: "Give Feedback",
        feedbackTitle: "Feedback Form",
        feedbackSubtitle: "Help us improve",
        feedbackPersonalInfo: "Personal Information",
        feedbackUsage: "Usage Information",
        feedbackPerformance: "Bot Performance",
        feedbackIssues: "Issues & Rating",
        feedbackAdditional: "Additional Feedback",
        feedbackSubmit: "Submit Feedback",
        feedbackSubmitting: "Submitting...",
        feedbackSuccess: "✅ Thank you for your feedback!",
        feedbackError: "❌ Failed to submit. Please try again."
    },
    hi: {
        title: "कुरुक्षेत्र इन्फोबॉट",
        subtitle: "AI द्वारा संचालित • 24/7 उपलब्ध",
        officialInfo: "आधिकारिक जानकारी",
        officialDesc: "सभी उत्तर यहाँ से प्राप्त किए गए हैं",
        welcomeTitle: "नमस्ते!",
        welcomeText: "मैं कुरुक्षेत्र जिले के लिए आपका AI सहायक हूँ। मुझसे पूछें:",
        welcomeOfficers: "अधिकारी और विभाग",
        welcomeTourist: "पर्यटन स्थल और विरासत",
        welcomeServices: "सेवाएं और योजनाएं",
        welcomeDistrict: "जिला जानकारी",
        welcomeEmergency: "आपातकालीन संपर्क",
        welcomeSuggestion: "शुरू करने के लिए नीचे दिए गए सुझाव आज़माएं!",
        inputPlaceholder: "कुरुक्षेत्र के बारे में कुछ भी पूछें...",
        clearChat: "चैट साफ़ करें",
        visitWebsite: "वेबसाइट पर जाएं",
        suggestions: "सुझाव",
        typing: "टाइप कर रहा है...",
        menuFeedback: "फीडबैक दें",
        feedbackTitle: "फीडबैक फॉर्म",
        feedbackSubtitle: "हमें बेहतर बनाने में मदद करें",
        feedbackPersonalInfo: "व्यक्तिगत जानकारी",
        feedbackUsage: "उपयोग की जानकारी",
        feedbackPerformance: "बॉट प्रदर्शन",
        feedbackIssues: "समस्याएं और रेटिंग",
        feedbackAdditional: "अतिरिक्त फीडबैक",
        feedbackSubmit: "फीडबैक सबमिट करें",
        feedbackSubmitting: "सबमिट हो रहा है...",
        feedbackSuccess: "✅ आपके फीडबैक के लिए धन्यवाद!",
        feedbackError: "❌ सबमिट विफल। कृपया पुनः प्रयास करें।"
    }
};

// ROTATING QUESTION SETS
const QUESTION_SETS = {
    en: [
        {
            title: "🏛️ General Info",
            questions: [
                { icon: "👤", text: "Who is DC?" },
                { icon: "🚨", text: "Emergency" },
                { icon: "🏛️", text: "Tourist Places" },
                { icon: "📊", text: "Population" }
            ]
        },
        {
            title: "📋 Services",
            questions: [
                { icon: "📋", text: "Birth Certificate" },
                { icon: "🏥", text: "Hospitals" },
                { icon: "🎓", text: "Universities" },
                { icon: "🚍", text: "How to reach?" }
            ]
        },
        {
            title: "🕉️ Heritage",
            questions: [
                { icon: "🕉️", text: "48 Kos Parikrama" },
                { icon: "🛕", text: "Brahma Sarovar" },
                { icon: "🏺", text: "Archaeological sites" },
                { icon: "📿", text: "Gita Jayanti" }
            ]
        },
        {
            title: "📖 Bhagavad Gita",
            questions: [
                { icon: "📖", text: "What is Bhagavad Gita?" },
                { icon: "🙏", text: "Karma Yoga meaning" },
                { icon: "🧘", text: "Meditation in Gita" },
                { icon: "⚔️", text: "Arjuna's dilemma" }
            ]
        },
        {
            title: "🏢 Government",
            questions: [
                { icon: "🏢", text: "SDM Office" },
                { icon: "📝", text: "Latest Tenders" },
                { icon: "💼", text: "Job Vacancies" },
                { icon: "🌾", text: "Agriculture Dept" }
            ]
        }
    ],
    hi: [
        {
            title: "🏛️ सामान्य जानकारी",
            questions: [
                { icon: "👤", text: "DC कौन हैं?" },
                { icon: "🚨", text: "आपातकालीन नंबर" },
                { icon: "🏛️", text: "पर्यटन स्थल" },
                { icon: "📊", text: "जनसंख्या" }
            ]
        },
        {
            title: "📋 सेवाएं",
            questions: [
                { icon: "📋", text: "जन्म प्रमाण पत्र" },
                { icon: "🏥", text: "अस्पताल" },
                { icon: "🎓", text: "विश्वविद्यालय" },
                { icon: "🚍", text: "कैसे पहुंचें?" }
            ]
        },
        {
            title: "🕉️ विरासत",
            questions: [
                { icon: "🕉️", text: "48 कोस परिक्रमा" },
                { icon: "🛕", text: "ब्रह्म सरोवर" },
                { icon: "🏺", text: "पुरातात्विक स्थल" },
                { icon: "📿", text: "गीता जयंती" }
            ]
        },
        {
            title: "📖 भगवद गीता",
            questions: [
                { icon: "📖", text: "भगवद गीता क्या है?" },
                { icon: "🙏", text: "कर्म योग का अर्थ" },
                { icon: "🧘", text: "गीता में ध्यान" },
                { icon: "⚔️", text: "अर्जुन की दुविधा" }
            ]
        },
        {
            title: "🏢 सरकारी",
            questions: [
                { icon: "🏢", text: "SDM कार्यालय" },
                { icon: "📝", text: "नवीनतम निविदाएं" },
                { icon: "💼", text: "नौकरी रिक्तियां" },
                { icon: "🌾", text: "कृषि विभाग" }
            ]
        }
    ]
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
    lucide.createIcons();
    
    // Load autocomplete data
    await loadAutocompleteData();
    
    // Apply language on load
    updateUI();
    
    // Hide welcome message and chips if chat history exists
    if (messages.length > 0) {
        document.getElementById('welcome-message').style.display = 'none';
        document.getElementById('chips-container').classList.add('hidden');
        document.getElementById('toggle-chips-btn').classList.remove('hidden');
        stopRotation();
    } else {
        // Only show chips and start rotation if no chat history
        renderChips();
        renderIndicators();
        startRotation();
    }
    
    renderMessages();
    scrollToBottom();
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('autocomplete-dropdown');
        const input = document.getElementById('user-input');
        if (e.target !== input && e.target !== dropdown) {
            dropdown.classList.add('hidden');
        }
    });
});

// ========================================
// AUTOCOMPLETE DROPDOWN - Type to Filter
// ========================================

let autocompleteData = []; // Will be populated from your autocomplete-data.json

// Load autocomplete data
async function loadAutocompleteData() {
    try {
        const response = await fetch('autocomplete-data.json');
        const data = await response.json();
        
        // Get current language
        const currentLang = document.documentElement.lang || 'en';
        
        // Use appropriate language data
        autocompleteData = data[currentLang] || data.en;
        
        console.log('Autocomplete data loaded:', autocompleteData.length, 'suggestions');
    } catch (error) {
        console.error('Error loading autocomplete data:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAutocompleteData();
    setupAutocomplete();
});
// Setup autocomplete event listeners
function setupAutocomplete() {
    const searchInput = document.getElementById('search-input');
    const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
    
    // Show autocomplete when typing
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length === 0) {
            // Hide if empty
            autocompleteDropdown.style.display = 'none';
        } else if (query.length >= 2) {
            // Show filtered results when 2+ characters
            const filtered = filterAutocomplete(query);
            renderAutocomplete(filtered);
            autocompleteDropdown.style.display = 'block';
        }
    });
    
    // Hide autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && 
            !autocompleteDropdown.contains(e.target)) {
            autocompleteDropdown.style.display = 'none';
        }
    });
    
    // Prevent autocomplete from closing when scrolling
    autocompleteDropdown.addEventListener('mousedown', function(e) {
        e.preventDefault();
    });
}


// Filter autocomplete suggestions
function filterAutocomplete(query) {
    const lowerQuery = query.toLowerCase();
    
    // Filter by keywords
    const matches = autocompleteData.filter(item => {
        // Check if query matches text
        if (item.text.toLowerCase().includes(lowerQuery)) {
            return true;
        }
        
        // Check if query matches keywords
        if (item.keywords) {
            const keywordArray = Array.isArray(item.keywords) 
                ? item.keywords 
                : item.keywords.split(' ');
            
            return keywordArray.some(keyword => 
                keyword.toLowerCase().includes(lowerQuery)
            );
        }
        
        return false;
    });
    
    // Return top 10 matches
    return matches.slice(0, 10);
}


// Render autocomplete results
function renderAutocomplete(suggestions) {
    const dropdown = document.getElementById('autocomplete-dropdown');
    
    if (suggestions.length === 0) {
        dropdown.innerHTML = `
            <div class="autocomplete-no-results">
                No suggestions found. Try different keywords.
            </div>
        `;
        return;
    }
    
    dropdown.innerHTML = suggestions.map(item => `
        <div class="autocomplete-item" onclick="selectAutocomplete('${escapeHtml(item.text)}')">
            <span class="autocomplete-item-icon">${item.icon || '🔍'}</span>
            <span class="autocomplete-item-text">${escapeHtml(item.text)}</span>
        </div>
    `).join('');
}


// Select an autocomplete suggestion
function selectAutocomplete(text) {
    const searchInput = document.getElementById('search-input');
    const dropdown = document.getElementById('autocomplete-dropdown');
    
    // Set input value
    searchInput.value = text;
    
    // Hide dropdown
    dropdown.style.display = 'none';
    
    // Perform search
    performSearch(text);
}


// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleAutocomplete(event) {
    const input = event.target;
    const value = input.value.trim().toLowerCase();
    const dropdown = document.getElementById('autocomplete-dropdown');
    
    // Hide dropdown if input is empty or less than 2 characters
    if (value.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }
    
    // Get suggestions based on current language
    const suggestions = getSuggestions(value);
    
    if (suggestions.length === 0) {
        dropdown.classList.add('hidden');
        return;
    }
    
    // Render suggestions
    dropdown.innerHTML = suggestions.slice(0, 5).map(item => {
        const highlighted = highlightMatch(item.text, value);
        return `
            <div class="autocomplete-item" onclick="selectSuggestion('${escapeHtml(item.text)}')">
                <span class="text-lg">${item.icon}</span>
                <span class="text-sm">${highlighted}</span>
            </div>
        `;
    }).join('');
    
    dropdown.classList.remove('hidden');
}

function getSuggestions(query) {
    const data = autocompleteData[currentLanguage] || [];
    
    // Filter suggestions that match the query
    return data.filter(item => 
        item.text.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="autocomplete-highlight">$1</span>');
}

function selectSuggestion(text) {
    document.getElementById('user-input').value = text;
    document.getElementById('autocomplete-dropdown').classList.add('hidden');
    document.getElementById('user-input').focus();
}

function escapeHtml(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

function renderMessages() {
    const container = document.getElementById('messages-list');
    container.innerHTML = messages.map(msg => `
        <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[85%] p-2 px-3 rounded-lg shadow-sm text-[14px] leading-relaxed relative message-box 
                ${msg.role === 'user' ? 'bg-[#d9fdd3] rounded-tr-none triangle-right' : 'bg-white rounded-tl-none triangle-left'}">
                <div class="text-gray-800 break-words">${formatText(msg.content)}</div>
                <div class="text-[10px] text-gray-500 text-right mt-1 flex justify-end gap-1">
                    ${msg.time} ${msg.role === 'user' ? '<span class="text-[#53bdeb]">✓✓</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderChips(skipAnimation = false) {
    const grid = document.getElementById('chips-grid');
    const titleEl = document.getElementById('chips-title');
    
    // Safety check
    if (!QUESTION_SETS[currentLanguage]) {
        currentLanguage = 'en';
    }
    
    if (currentSetIndex >= QUESTION_SETS[currentLanguage].length) {
        currentSetIndex = 0;
    }
    
    const currentSet = QUESTION_SETS[currentLanguage][currentSetIndex];
    
    if (!currentSet || !currentSet.questions) {
        console.error('Invalid question set');
        return;
    }
    
    if (skipAnimation) {
        titleEl.textContent = currentSet.title;
        grid.innerHTML = currentSet.questions.map(q => `
            <button onclick="handleChipClick('${q.text.replace(/'/g, "\\'")}')" 
                class="chip-button w-full bg-white text-[#008069] border-2 border-[#008069] px-3 py-2.5 rounded-xl text-sm shadow-md font-semibold hover:bg-[#008069] hover:text-white flex items-center justify-center gap-2">
                <span class="text-lg">${q.icon}</span>
                <span>${q.text}</span>
            </button>
        `).join('');
        grid.style.opacity = '1';
        titleEl.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
    } else {
        grid.style.opacity = '0';
        titleEl.style.opacity = '0';
        grid.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            titleEl.textContent = currentSet.title;
            grid.innerHTML = currentSet.questions.map(q => `
                <button onclick="handleChipClick('${q.text.replace(/'/g, "\\'")}')" 
                    class="chip-button w-full bg-white text-[#008069] border-2 border-[#008069] px-3 py-2.5 rounded-xl text-sm shadow-md font-semibold hover:bg-[#008069] hover:text-white flex items-center justify-center gap-2">
                    <span class="text-lg">${q.icon}</span>
                    <span>${q.text}</span>
                </button>
            `).join('');
            
            grid.style.transition = 'all 0.5s ease';
            titleEl.style.transition = 'all 0.5s ease';
            grid.style.opacity = '1';
            titleEl.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }, 300);
    }
}

function renderIndicators() {
    const container = document.getElementById('indicators');
    
    if (!QUESTION_SETS[currentLanguage]) {
        currentLanguage = 'en';
    }
    
    container.innerHTML = QUESTION_SETS[currentLanguage].map((_, index) => `
        <div class="w-2 h-2 rounded-full transition-all ${index === currentSetIndex ? 'bg-[#008069] w-6' : 'bg-gray-400'}"></div>
    `).join('');
}

function formatText(text) {
    if (!text) return '';
  let formatted = text.replace(/\n/g, '<br>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    formatted = formatted.replace(/_(.*?)_/g, '<i>$1</i>');
    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    return formatted.replace(urlRegex, (url) => {
        try {
            const decodedUrl = decodeURIComponent(url);
            const displayText = decodedUrl.length > 60 
                ? decodedUrl.substring(0, 57) + '...' 
                : decodedUrl;
            return `<a href="${url}" target="_blank" class="text-[#027eb5] hover:underline font-medium break-all">🔗 ${displayText}</a>`;
        } catch (e) {
            return `<a href="${url}" target="_blank" class="text-[#027eb5] hover:underline font-medium">🔗 ${url}</a>`;
        }
    });
}

// ============================================
// ROTATION FUNCTIONS
// ============================================

function rotateQuestions() {
    currentSetIndex = (currentSetIndex + 1) % QUESTION_SETS[currentLanguage].length;
    renderChips();
    renderIndicators();
}

function startRotation() {
    rotationInterval = setInterval(rotateQuestions, 4000);
}

function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
    }
}

function toggleChipsVisibility() {
    const chipsContainer = document.getElementById('chips-container');
    const toggleBtn = document.getElementById('toggle-chips-btn');
    
    if (chipsContainer.classList.contains('hidden')) {
        currentSetIndex = 0;
        renderChips(true);
        renderIndicators();
        chipsContainer.classList.remove('hidden');
        toggleBtn.classList.add('hidden');
        startRotation();
    } else {
        chipsContainer.classList.add('hidden');
        toggleBtn.classList.remove('hidden');
        stopRotation();
    }
    
    lucide.createIcons();
}

// ============================================
// LANGUAGE FUNCTIONS
// ============================================

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    localStorage.setItem('preferred_language', currentLanguage);
    currentSetIndex = 0;
    updateUI();
    renderChips();
    renderIndicators();
}

function updateUI() {
    const t = translations[currentLanguage];
    
    // Update header
    document.getElementById('header-title').textContent = t.title;
    document.getElementById('header-subtitle').textContent = t.subtitle;
    document.getElementById('lang-flag').textContent = currentLanguage === 'en' ? '🇬🇧' : '🇮🇳';
    document.getElementById('lang-code').textContent = currentLanguage.toUpperCase();
    
    // Update official info badge
    document.getElementById('official-info-title').textContent = t.officialInfo;
    document.getElementById('official-info-desc').textContent = t.officialDesc;
    
    // Update welcome message
    document.getElementById('welcome-title').textContent = t.welcomeTitle;
    document.getElementById('welcome-text').textContent = t.welcomeText;
    document.getElementById('welcome-officers').textContent = t.welcomeOfficers;
    document.getElementById('welcome-tourist').textContent = t.welcomeTourist;
    document.getElementById('welcome-services').textContent = t.welcomeServices;
    document.getElementById('welcome-district').textContent = t.welcomeDistrict;
    document.getElementById('welcome-emergency').textContent = t.welcomeEmergency;
    document.getElementById('welcome-suggestion').textContent = t.welcomeSuggestion;
    
    // Update input placeholder
    document.getElementById('user-input').placeholder = t.inputPlaceholder;
    
    // Update menu items
    document.getElementById('menu-feedback').textContent = t.menuFeedback;
    document.getElementById('menu-clear').textContent = t.clearChat;
    document.getElementById('menu-visit').textContent = t.visitWebsite;
    
    // Update suggestions button
    document.getElementById('suggestions-btn-text').textContent = t.suggestions;
    
    // Update typing indicator
    document.getElementById('typing-text').textContent = t.typing;
    
    // Update feedback modal
    if (document.getElementById('feedback-title')) {
        document.getElementById('feedback-title').textContent = t.feedbackTitle;
        document.getElementById('feedback-subtitle').textContent = t.feedbackSubtitle;
        document.getElementById('feedback-personal-info').textContent = t.feedbackPersonalInfo;
        document.getElementById('feedback-usage').textContent = t.feedbackUsage;
        document.getElementById('feedback-performance').textContent = t.feedbackPerformance;
        document.getElementById('feedback-issues').textContent = t.feedbackIssues;
        document.getElementById('feedback-additional').textContent = t.feedbackAdditional;
        document.getElementById('feedback-submit-text').textContent = t.feedbackSubmit;
    }
}

// ============================================
// GITA DETECTION
// ============================================

function isGitaQuery(text) {
    const lowerText = text.toLowerCase();
    
    // English Gita keywords
    const englishKeywords = [
        'gita', 'geeta', 'bhagavad', 'bhagwad', 'krishna', 'arjuna', 'arjun',
        'karma yoga', 'bhakti yoga', 'jnana yoga', 'dhyana yoga',
        'chapter', 'shlok', 'verse', 'mahabharata', 'mahabharat',
        'dharma', 'moksha', 'atman', 'brahman', 'yoga'
    ];
    
    // Hindi Gita keywords
    const hindiKeywords = [
        'गीता', 'भगवद', 'भगवान', 'कृष्ण', 'अर्जुन',
        'कर्म योग', 'भक्ति योग', 'ज्ञान योग', 'ध्यान योग',
        'अध्याय', 'श्लोक', 'महाभारत',
        'धर्म', 'मोक्ष', 'आत्मा', 'ब्रह्म', 'योग'
    ];
    
    const allKeywords = [...englishKeywords, ...hindiKeywords];
    
    return allKeywords.some(keyword => lowerText.includes(keyword));
}

// ============================================
// MESSAGE HANDLING
// ============================================

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}
// ========================================
// POPULAR SEARCH PILLS - Click to Search
// ========================================

function quickSearch(query) {
    const searchInput = document.getElementById('search-input');
    searchInput.value = query;
    
    // Hide autocomplete if open
    document.getElementById('autocomplete-dropdown').style.display = 'none';
    
    // Trigger your existing search function
    performSearch(query);
}

function handleChipClick(text) {
    document.getElementById('user-input').value = text;
    document.getElementById('chips-container').classList.add('hidden');
    document.getElementById('autocomplete-dropdown').classList.add('hidden');
    stopRotation();
    sendMessage();
}

async function sendMessage() {
    const inputEl = document.getElementById('user-input');
    const text = inputEl.value.trim();
    if (!text) return;

    // Hide autocomplete
    document.getElementById('autocomplete-dropdown').classList.add('hidden');
    
    // Hide welcome message after first interaction
    document.getElementById('welcome-message').style.display = 'none';
    
    // Stop rotation after first message
    stopRotation();

    // Detect if this is a Gita query
    const isGita = isGitaQuery(text);
    const webhookUrl = isGita ? GITA_WEBHOOK_URL : N8N_WEBHOOK_URL;

    // Add User Message
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    messages.push({ role: 'user', content: text, time: time });
    saveChat();
    renderMessages();
    scrollToBottom();
    inputEl.value = '';

    // Show Loading
    document.getElementById('loading-indicator').classList.remove('hidden');
    document.getElementById('chips-container').classList.add('hidden');
    scrollToBottom();

    try {
        // Call appropriate webhook (Gita or District)
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question: text,  // Gita webhook uses 'question'
                message: text,   // District webhook uses 'message'
                language: currentLanguage
            })
        });
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Extract bot response (handle both formats)
        let botContent;
        if (isGita) {
            // Gita webhook returns { answer: "..." } or { response: "..." }
            botContent = data.answer || data.response || 'No response received';
        } else {
            // District webhook returns array with { response: "..." }
            botContent = (Array.isArray(data) ? data[0].response : data.response) || 'No response received';
        }
        
        // Add indicator and disclaimer if Gita response
        if (isGita) {
            const disclaimer = currentLanguage === 'hi' 
                ? '_यह AI द्वारा उत्पन्न प्रतिक्रिया है। कृपया विद्वानों से सत्यापन करें।_'
                : '_This is an AI-generated response. Please verify with scholars._';
            botContent = `📖 **Gita Wisdom**\n\n${botContent}\n\n${disclaimer}`;
        }
        const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        messages.push({ role: 'bot', content: botContent, time: botTime });
        saveChat();

    } catch (error) {
        console.error('Error:', error);
        const errorTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        messages.push({ role: 'bot', content: "⚠️ Unable to connect to server. Please try again later.", time: errorTime });
        saveChat();
    } finally {
        document.getElementById('loading-indicator').classList.add('hidden');
        document.getElementById('toggle-chips-btn').classList.remove('hidden');
        lucide.createIcons();
        renderMessages();
        scrollToBottom();
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function saveChat() {
    localStorage.setItem('kwr_chat_history', JSON.stringify(messages));
}

function clearChat() {
    if(confirm("🗑️ Delete all chat history?")) {
        messages = [];
        localStorage.removeItem('kwr_chat_history');
        document.getElementById('welcome-message').style.display = 'flex';
        renderMessages();
        toggleMenu();
    }
}

function toggleMenu() {
    const menu = document.getElementById('menu-dropdown');
    menu.classList.toggle('hidden');
    if (!menu.classList.contains('hidden')) {
        lucide.createIcons();
    }
}

function scrollToBottom() {
    const container = document.getElementById('chat-container');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// ============================================
// FEEDBACK MODAL FUNCTIONS
// ============================================

function openFeedbackModal() {
    document.getElementById('feedback-modal').classList.remove('hidden');
    document.getElementById('menu-dropdown').classList.add('hidden');
    lucide.createIcons();
}

function closeFeedbackModal() {
    document.getElementById('feedback-modal').classList.add('hidden');
    document.getElementById('feedback-form').reset();
    document.getElementById('feedback-problem-details').classList.add('hidden');
}

function toggleProblemDetails() {
    const hadProblems = document.getElementById('feedback-problems').value;
    const detailsField = document.getElementById('feedback-problem-details');
    
    if (hadProblems === 'Yes') {
        detailsField.classList.remove('hidden');
    } else {
        detailsField.classList.add('hidden');
    }
}

// Handle feedback form submission
document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('feedback-submit-btn');
            const submitText = document.getElementById('feedback-submit-text');
            const originalText = submitText.textContent;
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitText.textContent = translations[currentLanguage].feedbackSubmitting;
            
            // Collect form data
            const formData = new FormData(feedbackForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                country: formData.get('country') || '',
                state: formData.get('state') || '',
                city: formData.get('city') || '',
                usageFrequency: formData.get('usageFrequency'),
                purpose: formData.get('purpose') || '',
                understood: formData.get('understood') || '',
                helpful: formData.get('helpful') || '',
                responseSpeed: formData.get('responseSpeed'),
                easyToUse: formData.get('easyToUse'),
                hadProblems: formData.get('hadProblems') || 'No',
                problemDetails: formData.get('problemDetails') || '',
                rating: formData.get('rating'),
                useAgain: formData.get('useAgain'),
                improvements: formData.get('improvements') || '',
                comments: formData.get('comments') || ''
            };
            
            try {
                const response = await fetch(FEEDBACK_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    // Success
                    alert(translations[currentLanguage].feedbackSuccess);
                    closeFeedbackModal();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                console.error('Feedback submission error:', error);
                alert(translations[currentLanguage].feedbackError);
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitText.textContent = originalText;
            }
        });
    }
});
