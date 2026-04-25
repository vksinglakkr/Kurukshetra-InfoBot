// ============================================
// KURUKSHETRA INFOBOT - Main JavaScript File
// ============================================

// CONFIGURATION
const N8N_WEBHOOK_URL = "https://n8n-workflow-test.duckdns.org/webhook/chat_InfoBotKkr";
const FEEDBACK_WEBHOOK_URL = "https://n8n-workflow-test.duckdns.org/webhook/InfoBot_FeedKkr";
const GITA_WEBHOOK_URL = "https://n8n-workflow-test.duckdns.org/webhook/InfoBot_AskGitaKkr";

// GLOBAL STATE
let currentLanguage = localStorage.getItem('preferred_language') || 'en';
let currentSetIndex = 0;
let rotationInterval;
let messages = JSON.parse(localStorage.getItem('kwr_chat_history')) || [];
let autocompleteData = { en: [], hi: [] };

// ============================================
// WHATSAPP ADAPTER INITIALIZATION
// ============================================
let whatsappAdapter = null;

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
    try {
        whatsappAdapter = WhatsAppAdapter.init({
            baseUrl: window.location.origin,
            onShare: (data) => {
                console.log('✅ Content shared via WhatsApp:', data);
            }
        });
        
        console.log('✅ WhatsApp Adapter initialized successfully');
        console.log('📱 WhatsApp Available:', whatsappAdapter.isWhatsAppAvailable());
        console.log('📦 Adapter Version:', whatsappAdapter.version);
        
    } catch (error) {
        console.error('❌ WhatsApp Adapter initialization failed:', error);
    }
});
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
    
    // Show or hide elements based on chat history
    if (messages.length > 0) {
        // Has chat history: hide welcome, hide chips, show toggle button
        document.getElementById('welcome-message').style.display = 'none';
        document.getElementById('chips-container').classList.add('hidden');
        document.getElementById('toggle-chips-btn').classList.remove('hidden');
        stopRotation();
    } else {
        // No chat history: show welcome, show chips, show toggle button (as "Hide")
        document.getElementById('welcome-message').style.display = 'flex';
        document.getElementById('chips-container').classList.remove('hidden');
        document.getElementById('toggle-chips-btn').classList.remove('hidden'); // CHANGED: Show button
        document.getElementById('suggestions-btn-text').textContent = 
            currentLanguage === 'hi' ? 'छुपाएं' : 'Hide'; // Set text to "Hide"
        renderChips();
        renderIndicators();
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
// ============================================
// SHARE APP INVITATION FUNCTION
// ============================================
function shareApp() {
    console.log('📱 Share App button clicked');
    
    if (!whatsappAdapter) {
        alert('WhatsApp sharing not available');
        return;
    }
    
    // Get current language
    const lang = currentLanguage || 'en';
    
    // Create invitation message based on language
    let inviteMessage;
    
    if (lang === 'hi') {
        inviteMessage = `🕉️ *Kurukshetra-InfoBot - AI Chatbot*

कुरुक्षेत्र की विरासत को डिजिटल रूप से खोजें!

✨ विशेषताएं:
- 90+ धरोहर स्थल
- भगवद गीता ज्ञान
- आपातकालीन संपर्क
- पर्यटन जानकारी
- द्विभाषी (हिंदी/अंग्रेजी)

🔗 अभी चैट करें:
${window.location.href}

_आध्यात्मिक विरासत का डिजिटल अनुभव!_ 🙏`;
    } else {
        inviteMessage = `🕉️ *Kurukshetra-InfoBot - AI Chatbot*

Discover Kurukshetra's heritage digitally!

✨ Features:
- 90+ Heritage Sites
- Bhagavad Gita Wisdom
- Emergency Contacts
- Tourism Information
- Bilingual (Hindi/English)

🔗 Chat now:
${window.location.href}

_Experience spiritual heritage digitally!_ 🙏`;
    }
    
    console.log('Sharing app invitation...');
    
    // Share via WhatsApp
    whatsappAdapter.share(inviteMessage);
    
    console.log('✅ App invitation shared');
}
// ============================================
// AUTOCOMPLETE FUNCTIONS
// ============================================

async function loadAutocompleteData() {
    try {
        const response = await fetch('autocomplete-data.json');
        autocompleteData = await response.json();
        console.log('Autocomplete data loaded:', autocompleteData);
    } catch (error) {
        console.error('Failed to load autocomplete data:', error);
        // Fallback to empty arrays if file doesn't exist
        autocompleteData = { en: [], hi: [] };
    }
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
    container.innerHTML = messages.map((msg, index) => {
        // Format the message content
        const formattedContent = formatText(msg.content);
        
        // Add share button HTML only for bot messages
        const shareButton = (msg.role === 'bot' && whatsappAdapter) ? `
            <button class="share-btn" onclick="shareBotMessage(${index})">
                <i data-lucide="share-2"></i> Share
            </button>
        ` : '';
        
        // Add listen button HTML only for bot messages (NEW!)
        const listenButton = (msg.role === 'bot') ? `
            <button onclick="speakText(this)" 
                    class="text-gray-500 hover:text-[#008069] transition-all p-1 rounded-full hover:bg-gray-100" 
                    title="Listen to response" 
                    data-text="${msg.content.replace(/"/g, '&quot;').replace(/<[^>]*>/g, '')}">
                <i data-lucide="volume-2" class="w-4 h-4"></i>
            </button>
        ` : '';
        
        return `
            <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[85%] p-2 px-3 rounded-lg shadow-sm text-[14px] leading-relaxed relative message-box 
                    ${msg.role === 'user' ? 'bg-[#d9fdd3] rounded-tr-none triangle-right' : 'bg-white rounded-tl-none triangle-left'}">
                    
                    ${msg.role === 'bot' ? `
                        <div class="flex items-center justify-between mb-2 pb-1 border-b border-gray-200">
                            <span class="text-xs font-semibold text-[#008069]">Response</span>
                            ${listenButton}
                        </div>
                    ` : ''}
                    
                    <div class="text-gray-800 break-words">${formattedContent}</div>
                    <div class="text-[10px] text-gray-500 text-right mt-1 flex justify-end gap-1">
                        ${msg.time} ${msg.role === 'user' ? '<span class="text-[#53bdeb]">✓✓</span>' : ''}
                    </div>
                    ${shareButton}
                </div>
            </div>
        `;
    }).join('');
    
    // Ensure correct UI state based on messages
    if (messages.length === 0) {
        // No messages: show toggle button as "Hide", show chips
        document.getElementById('toggle-chips-btn').classList.remove('hidden');
        document.getElementById('suggestions-btn-text').textContent = 
            currentLanguage === 'hi' ? 'छुपाएं' : 'Hide';
        document.getElementById('chips-container').classList.remove('hidden');
    } else {
        // Has messages: show toggle button as "Suggestions", chips controlled by toggle state
        document.getElementById('toggle-chips-btn').classList.remove('hidden');
        document.getElementById('suggestions-btn-text').textContent = 
            currentLanguage === 'hi' ? 'सुझाव' : 'Suggestions';
    }
    
    // Render Lucide icons (for share icon and arrows)
    lucide.createIcons();
}

// ============================================
// SHARE BOT MESSAGE FUNCTION
// ============================================
function shareBotMessage(messageIndex) {
    console.log('📤 Sharing message index:', messageIndex);
    
    // Check if WhatsApp adapter is available
    if (!whatsappAdapter) {
        alert('WhatsApp sharing not available');
        console.error('whatsappAdapter is null');
        return;
    }
    
    // Get the message
    const msg = messages[messageIndex];
    if (!msg || msg.role !== 'bot') {
        console.error('Invalid message or not a bot message');
        return;
    }
    
    // Clean the message content (remove HTML tags and extra formatting)
    let cleanContent = msg.content
        .replace(/<[^>]*>/g, '')              // Remove HTML tags
        .replace(/\*\*/g, '*')                // Convert bold to single asterisk
        .replace(/#{1,6}\s/g, '')             // Remove markdown headers
        .replace(/\n\n+/g, '\n\n')            // Clean multiple line breaks
        .replace(/🔗\s*https?:\/\/[^\s]+/g, '') // Remove link URLs (keep text)
        .trim();
    
    // Limit length if too long
    if (cleanContent.length > 500) {
        cleanContent = cleanContent.substring(0, 497) + '...';
    }
    
    // Create shareable message with branding
    const shareMessage = `🕉️ *Kurukshetra-InfoBot*

${cleanContent}

💬 Chat with our bot: ${window.location.href}

_Discover Kurukshetra Heritage_`;
    
    console.log('📱 Sharing via WhatsApp:', shareMessage.substring(0, 100) + '...');
    
    // Share via WhatsApp
    try {
        whatsappAdapter.share(shareMessage);
        console.log('✅ Share triggered successfully');
    } catch (error) {
        console.error('❌ Share failed:', error);
        alert('Failed to share. Please try again.');
    }
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
        <div onclick="jumpToQuestionSet(${index})" class="w-2 h-2 rounded-full transition-all cursor-pointer hover:scale-125 ${index === currentSetIndex ? 'bg-[#008069] w-6' : 'bg-gray-400'}"></div>
    `).join('');
}

function formatText(text) {
    if (!text) return '';

    // 1. Handle New Lines
    let formatted = text.replace(/\n/g, '<br>');

    // 2. Handle Bold (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // 3. Handle URLs (Process these BEFORE italics)
    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    formatted = formatted.replace(urlRegex, (url) => {
        try {
            const cleanUrl = url.replace(/[.,!;]+$/, ''); 
            const decodedUrl = decodeURIComponent(cleanUrl);
            const displayText = decodedUrl.length > 60 
                ? decodedUrl.substring(0, 57) + '...' 
                : decodedUrl;
                
            return `<a href="${cleanUrl}" target="_blank" class="text-[#027eb5] hover:underline font-medium break-all">🔗 ${displayText}</a>`;
        } catch (e) {
            return `<a href="${url}" target="_blank" class="text-[#027eb5] hover:underline font-medium">🔗 ${url}</a>`;
        }
    });

    // 4. Handle Italics (_text_) - THE CRITICAL FIX
    // This regex ensures the underscore is only converted if it's at the start 
    // of a word or preceded by a space, preventing it from catching the URL ID.
    formatted = formatted.replace(/(^|\s)_(.*?)_(\s|$)/g, '$1<i>$2</i>$3');

    return formatted;
}

// ============================================
// ROTATION FUNCTIONS (MANUAL ONLY)
// ============================================

function nextQuestionSet() {
    currentSetIndex = (currentSetIndex + 1) % QUESTION_SETS[currentLanguage].length;
    renderChips();
    renderIndicators();
    lucide.createIcons();
}

function previousQuestionSet() {
    currentSetIndex = (currentSetIndex - 1 + QUESTION_SETS[currentLanguage].length) % QUESTION_SETS[currentLanguage].length;
    renderChips();
    renderIndicators();
    lucide.createIcons();
}

function jumpToQuestionSet(index) {
    currentSetIndex = index;
    renderChips();
    renderIndicators();
    lucide.createIcons();
}

function rotateQuestions() {
    // Kept for compatibility but not used for auto-rotation
    nextQuestionSet();
}

function startRotation() {
    // Auto-rotation disabled - manual navigation only
    // Function kept for compatibility
}

function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
    }
}

function toggleChipsVisibility() {
    const chipsContainer = document.getElementById('chips-container');
    const toggleBtn = document.getElementById('toggle-chips-btn');
    const btnText = document.getElementById('suggestions-btn-text');
    
    if (chipsContainer.classList.contains('hidden')) {
        // CHIPS ARE HIDDEN → Show them
        currentSetIndex = 0;
        renderChips(true);
        renderIndicators();
        chipsContainer.classList.remove('hidden');  // Show chips
        btnText.textContent = currentLanguage === 'hi' ? 'छुपाएं' : 'Hide'; // Change text
        // No auto-rotation - manual only
    } else {
        // CHIPS ARE VISIBLE → Hide them
        chipsContainer.classList.add('hidden');     // Hide chips
        btnText.textContent = currentLanguage === 'hi' ? 'सुझाव' : 'Suggestions'; // Reset text
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
    updateVoiceLanguage(currentLanguage);
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
    document.getElementById('menu-feedback-text').textContent = t.menuFeedback;
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
    
    // Exclude keywords - these indicate NOT a Gita query
    const excludeKeywords = [
        'anubhav', 'kendra', 'museum', 'experience center', 'experience centre',
        'visit', 'timings', 'ticket', 'entry fee', 'location', 'jyotisar', 'address',
        'अनुभव', 'केंद्र', 'संग्रहालय', 'समय', 'टिकट'
    ];
    
    // If query contains exclude keywords, it's NOT a Gita query
    const hasExclude = excludeKeywords.some(keyword => lowerText.includes(keyword));
    if (hasExclude) {
        console.log('❌ Not a Gita query (contains tourism/museum keywords)');
        return false;
    }
    
    // Core Gita keywords (most specific)
    const coreGitaKeywords = [
        'gita', 'geeta', 'bhagavad', 'bhagwad',
        'गीता', 'भगवद'
    ];
    
    // If has core Gita keywords, it's definitely a Gita query
    const hasCore = coreGitaKeywords.some(keyword => lowerText.includes(keyword));
    if (hasCore) {
        console.log('✅ Gita query detected (core keywords)');
        return true;
    }
    
    // Spiritual/philosophical keywords (require additional Gita context)
    const spiritualKeywords = [
        'karma yoga', 'bhakti yoga', 'jnana yoga', 'dhyana yoga',
        'shlok', 'verse', 'chapter', 'अध्याय', 'श्लोक',
        'dharma', 'moksha', 'atman',
        'धर्म', 'मोक्ष', 'आत्मा',
        'कर्म योग', 'भक्ति योग', 'ज्ञान योग', 'ध्यान योग'
    ];
    
    // Character names (only Gita query if asking about teachings)
    const characterKeywords = [
        'krishna', 'arjuna', 'arjun',
        'कृष्ण', 'अर्जुन', 'भगवान'
    ];
    
    // Epic keywords (NOT Gita unless combined with core)
    const epicKeywords = [
        'mahabharata', 'mahabharat', 'महाभारत'
    ];
    
    // Check spiritual keywords
    const hasSpiritual = spiritualKeywords.some(keyword => lowerText.includes(keyword));
    if (hasSpiritual) {
        console.log('✅ Gita query detected (spiritual keywords)');
        return true;
    }
    
    // Check character keywords (but exclude if asking about places/history)
    const hasCharacter = characterKeywords.some(keyword => lowerText.includes(keyword));
    if (hasCharacter) {
        // Exclude if asking about temples, places, history
        const placeKeywords = ['temple', 'mandir', 'place', 'statue', 'मंदिर', 'स्थान', 'मूर्ति'];
        const hasPlace = placeKeywords.some(keyword => lowerText.includes(keyword));
        
        if (!hasPlace) {
            console.log('✅ Gita query detected (character with teachings context)');
            return true;
        }
    }
    
    // Epic keywords alone do NOT make it a Gita query
    const hasEpic = epicKeywords.some(keyword => lowerText.includes(keyword));
    if (hasEpic) {
        console.log('❌ Not a Gita query (Mahabharat without Gita context)');
        return false;
    }
    
    // Check for standalone "yoga" (too generic, exclude)
    if (lowerText === 'yoga' || lowerText === 'योग') {
        console.log('❌ Not a Gita query (generic yoga)');
        return false;
    }
    
    console.log('❌ Not a Gita query (no matching keywords)');
    return false;
}

// ============================================
// MESSAGE HANDLING
// ============================================

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

function handleChipClick(text) {
    document.getElementById('user-input').value = text;
    document.getElementById('chips-container').classList.add('hidden');
    document.getElementById('autocomplete-dropdown').classList.add('hidden');
    // Show the toggle button after selecting a chip
    document.getElementById('toggle-chips-btn').classList.remove('hidden');
    // Update button text to "Suggestions"
    document.getElementById('suggestions-btn-text').textContent = 
        currentLanguage === 'hi' ? 'सुझाव' : 'Suggestions';
    stopRotation();
    sendMessage();
}

// ============================================
// FIXED sendMessage() FUNCTION
// Better error handling and JSON parsing
// ============================================

async function sendMessage() {
    const inputEl = document.getElementById('user-input');
    const text = inputEl.value.trim();
    if (!text) return;
    
    // Hide autocomplete
    document.getElementById('autocomplete-dropdown').classList.add('hidden');
    
    // Hide welcome message after first interaction
    document.getElementById('welcome-message').style.display = 'none';
    
    // Hide chips container after sending message
    document.getElementById('chips-container').classList.add('hidden');
    
    // Show toggle button after first message
    document.getElementById('toggle-chips-btn').classList.remove('hidden');
    
    // Stop rotation after first message
    stopRotation();
    
    // Detect if this is a Gita query
    const isGita = isGitaQuery(text);
    const webhookUrl = isGita ? GITA_WEBHOOK_URL : N8N_WEBHOOK_URL;
    
    console.log('=== SEND MESSAGE DEBUG ===');
    console.log('Message:', text);
    console.log('Language:', currentLanguage);
    console.log('Is Gita Query:', isGita);
    console.log('Webhook URL:', webhookUrl);
    console.log('========================');
    
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
                language: currentLanguage,
                district: window.DISTRICT_KEY || 'kurukshetra'  // ← THIS IS THE MAGIC LINE
            })
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        // FIX 1: CHECK HTTP STATUS FIRST
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        // FIX 2: SAFE JSON PARSING
        let data;
        try {
            const responseText = await response.text();
            console.log('Raw response length:', responseText.length);
            console.log('Raw response:', responseText.substring(0, 200)); 
            
            if (!responseText || responseText.trim() === '') {
                throw new Error('Empty response from server');
            }
            
            data = JSON.parse(responseText);
            console.log('Parsed data:', data);
            
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            throw new Error('Invalid response format from server');
        }
        
        // EXTRACT BOT RESPONSE
        let botContent;
        

if (isGita) {
    botContent = data.answer || data.response || data.text || null;
    if (!botContent) throw new Error('Invalid Gita response format');

    botContent = botContent.trim().replace(/\|\|\s*$/, '');

    // The &zwnj; (Zero-Width Non-Joiner) is an invisible wall 
    // that stops formatting tags from connecting.
    const disclaimer = currentLanguage === 'hi' 
        ? '\n\n&zwnj;_यह AI द्वारा उत्पन्न प्रतिक्रिया है। कृपया विद्वानों से सत्यापन करें।_'
        : '\n\n&zwnj;_This is an AI-generated response. Please verify with scholars._';
    
    botContent = `📖 **Gita Wisdom**\n\n${botContent}${disclaimer}`;
} else {
            // District webhook returns array or object
            if (Array.isArray(data)) {
                botContent = data[0]?.response || data[0]?.text || null;
            } else {
                botContent = data.response || data.text || data.message || null;
            }
            
            if (!botContent) {
                console.error('District response missing response field:', data);
                throw new Error('Invalid district response format');
            }
        }
        
        const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        messages.push({ role: 'bot', content: botContent, time: botTime });
        saveChat();
        
        console.log('✅ Message sent successfully');
        
    } catch (error) {
        console.error('❌ Error in sendMessage:', error);
        const errorTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let errorMessage;
        if (error.message.includes('Empty response')) {
            errorMessage = currentLanguage === 'hi' ? '⚠️ सर्वर से कोई उत्तर नहीं मिला।' : '⚠️ No response from server.';
        } else if (error.message.includes('Invalid response format') || error.message.includes('JSON')) {
            errorMessage = currentLanguage === 'hi' ? '⚠️ सर्वर ने अमान्य प्रतिक्रिया भेजी।' : '⚠️ Server sent invalid response.';
        } else if (error.name === 'TypeError') {
            errorMessage = currentLanguage === 'hi' ? '⚠️ इंटरनेट कनेक्शन की जांच करें।' : '⚠️ Check internet connection.';
        } else {
            errorMessage = currentLanguage === 'hi' ? `⚠️ कुछ गलत हो गया।` : `⚠️ Something went wrong.`;
        }
        
        messages.push({ role: 'bot', content: errorMessage, time: errorTime });
        saveChat();
        
    } finally {
        document.getElementById('loading-indicator').classList.add('hidden');
        if (messages.length > 0) {
            document.getElementById('toggle-chips-btn').classList.remove('hidden');
        }
        lucide.createIcons();
        renderMessages();
        scrollToBottom();
    }
}

// ============================================
// DEBUGGING HELPER FUNCTION
// ============================================

// Add this to help debug webhook responses
function debugWebhookResponse(response, data) {
    console.log('=== WEBHOOK RESPONSE DEBUG ===');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Data keys:', Object.keys(data || {}));
    console.log('Full data:', JSON.stringify(data, null, 2));
    console.log('============================');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function saveChat() {
    localStorage.setItem('kwr_chat_history', JSON.stringify(messages));
}

function clearChat() {
    if(confirm("🗑️ Delete all chat history?")) {
        // Clear data
        messages = [];
        localStorage.removeItem('kwr_chat_history');
        
        // Reset UI state - back to initial load state
        document.getElementById('welcome-message').style.display = 'flex';
        document.getElementById('chips-container').classList.remove('hidden');
        document.getElementById('toggle-chips-btn').classList.remove('hidden'); // SHOW button
        
        // Set button text to "Hide" since chips are visible
        document.getElementById('suggestions-btn-text').textContent = 
            currentLanguage === 'hi' ? 'छुपाएं' : 'Hide';
        
        // Reset chips to first set
        currentSetIndex = 0;
        renderChips(true);
        renderIndicators();
        
        // Render empty messages (will clear the chat display)
        renderMessages();
        
        // Close menu
        toggleMenu();
        
        // Recreate icons for arrows
        lucide.createIcons();
    }
}

function toggleMenu() {
    const menu = document.getElementById('menu-dropdown');
    
    if (!menu) {
        console.error('Menu not found');
        return;
    }
    
    console.log('Toggle menu clicked - Current state:', menu.classList.contains('hidden') ? 'hidden' : 'visible');
    
    menu.classList.toggle('hidden');
    
    console.log('New state:', menu.classList.contains('hidden') ? 'hidden' : 'visible');
    
    // Refresh Lucide icons if menu is now visible
    if (!menu.classList.contains('hidden')) {
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 50);
    }
}
// ============================================
// CLICK OUTSIDE TO CLOSE MENU
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const menu = document.getElementById('menu-dropdown');
    const menuButton = document.querySelector('button[onclick="toggleMenu()"]');
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!menu.classList.contains('hidden')) {
            if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
                menu.classList.add('hidden');
            }
        }
    });
    
    // Close menu when clicking on menu items
    const menuItems = menu.querySelectorAll('button, a');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menu.classList.add('hidden');
        });
    });
});

// BONUS: Close with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const menu = document.getElementById('menu-dropdown');
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    }
});
function scrollToBottom() {
    const container = document.getElementById('chat-container');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}
// TEXT-TO-SPEECH FEATURE
let currentSpeech = null;
let isSpeaking = false;

function speakText(button) {
    const text = button.getAttribute('data-text');
    if (!text) return;
    
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').trim();
    
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        button.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4"></i>';
        lucide.createIcons();
        return;
    }
    
    currentSpeech = new SpeechSynthesisUtterance(cleanText);
    currentSpeech.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    currentSpeech.rate = 0.9;
    
    button.innerHTML = '<i data-lucide="square" class="w-4 h-4"></i>';
    button.classList.add('text-red-500');
    lucide.createIcons();
    
    currentSpeech.onstart = () => isSpeaking = true;
    currentSpeech.onend = () => {
        isSpeaking = false;
        button.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4"></i>';
        button.classList.remove('text-red-500');
        lucide.createIcons();
    };
    
    window.speechSynthesis.speak(currentSpeech);
}

// ==========================================
// CITYMITRA PROXIMITY ALERTS (GEO-FENCING)
// ==========================================

// 1. Kurukshetra Tourist Sites Data (JSON)
const touristSites = [
    {
        id: "brahma_sarovar",
        name: "Brahma Sarovar",
        lat: 29.9601,
        lng: 76.8315,
        radius_km: 12.0, // Alert if within 2km
        message: "You are very close to the holy Brahma Sarovar! Would you like to know more about its history?",
        link: "https://kurukshetra.gov.in/kurukshetraattractions/brahma-sarovar/"
    },
    {
        id: "jyotisar",
        name: "Jyotisar Birthplace of Bhagavad Gita",
        lat: 29.9542,
        lng: 76.7570,
        radius_km: 11.5,
        message: "You are near Jyotisar, the sacred site where Lord Krishna delivered the Bhagavad Gita.",
        link: "https://kurukshetra.gov.in/kurukshetraattractions/jyotisar/"
    },
    {
        id: "birla_mandir",
        name: "Birla Mandir",
        lat: 29.9575,
        lng: 76.8213,
        radius_km: 11.0,
        message: "The beautiful Birla Mandir is just a short walk away. Click here for details.",
        link: "https://kurukshetra.gov.in/kurukshetraattractions/birla-mandir/"
    }
    // You can easily add more sites here!
];

// State variables to track what we've done
const notifiedSites = new Set();
let locationWatchId = null;

// 2. Toggle Function (Connected to your new HTML switch)
function toggleLocationAlerts() {
    const isEnabled = document.getElementById('location-toggle').checked;
    
    if (isEnabled) {
        startLocationTracking();
    } else {
        stopLocationTracking();
    }
}

// 3. Start tracking the user's location
function startLocationTracking() {
    if ("geolocation" in navigator) {
        // Send a quick bot message confirming it's on
        addProximitySystemMessage("📍 Nearby alerts enabled! I'll notify you when you are close to important sites.");
        
        locationWatchId = navigator.geolocation.watchPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                checkProximity(userLat, userLng);
            },
            (error) => {
                console.warn("Location tracking error:", error.message);
                if (error.code === error.PERMISSION_DENIED) {
                    addProximitySystemMessage("⚠️ Please allow location permissions in your browser to use Nearby Alerts.");
                    document.getElementById('location-toggle').checked = false; // Turn the toggle back off
                }
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
        );
    } else {
        addProximitySystemMessage("⚠️ Geolocation is not supported by your browser.");
        document.getElementById('location-toggle').checked = false;
    }
}

// 4. Stop tracking
function stopLocationTracking() {
    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
        addProximitySystemMessage("🔕 Nearby alerts disabled.");
    }
}

// 5. The core logic: Calculate distance and trigger alerts
function checkProximity(userLat, userLng) {
    touristSites.forEach(site => {
        const distance = calculateDistance(userLat, userLng, site.lat, site.lng);
        
        // If within radius AND we haven't alerted them yet during this session
        if (distance <= site.radius_km && !notifiedSites.has(site.id)) {
            notifiedSites.add(site.id);
            showProximityAlertBubble(site.name, site.message, site.link);
        }
    });
}

// 6. Math: Haversine Formula (Calculates km distance between two coordinates)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
}

// 7. Inject the styled location alert into the chat
function showProximityAlertBubble(siteName, message, link) {
    const messagesList = document.getElementById('messages-list');
    
    // Designed to match your WhatsApp-style Tailwind classes perfectly
    const alertHtml = `
        <div class="flex justify-start">
            <div class="max-w-[85%] p-3 rounded-lg rounded-tl-none shadow-sm bg-white message-box triangle-left border border-[#008069]/30">
                <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <div class="bg-green-100 p-1.5 rounded-full text-[#008069]">
                        <i data-lucide="map-pin" class="w-4 h-4"></i>
                    </div>
                    <strong class="text-sm text-[#008069]">Nearby Alert: ${siteName}</strong>
                </div>
                <div class="text-gray-800 text-[14px] leading-relaxed mb-3">
                    ${message}
                </div>
                <a href="${link}" target="_blank" class="inline-flex items-center gap-1 bg-[#008069]/10 text-[#008069] px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#008069]/20 transition-colors">
                    View Details <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
            </div>
        </div>
    `;
    
    messagesList.insertAdjacentHTML('beforeend', alertHtml);
    
    // Re-render the Lucide icons for the newly added HTML
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Scroll chat to the bottom
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 8. Utility function for basic system messages (on/off alerts)
function addProximitySystemMessage(text) {
    const messagesList = document.getElementById('messages-list');
    const msgHtml = `
        <div class="flex justify-start">
            <div class="max-w-[85%] p-3 rounded-lg rounded-tl-none shadow-sm bg-white message-box triangle-left">
                <div class="text-gray-600 text-[13px] leading-relaxed italic">
                    ${text}
                </div>
            </div>
        </div>
    `;
    messagesList.insertAdjacentHTML('beforeend', msgHtml);
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
