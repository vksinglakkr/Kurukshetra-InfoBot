<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp Adapter Test - Kurukshetra Mitra</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui; background: linear-gradient(135deg, #fdfbf7 0%, #e6d5c3 100%); min-height: 100vh; padding: 2rem; }
        .container { max-width: 1000px; margin: 0 auto; }
        .hero { text-align: center; margin-bottom: 2rem; }
        .hero h1 { font-size: 2.5rem; color: #8B4513; margin-bottom: 0.5rem; }
        .badge { display: inline-block; background: #25D366; color: white; padding: 0.5rem 1.5rem; border-radius: 50px; font-weight: 600; margin-top: 1rem; }
        .card { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 10px 40px rgba(139,69,19,0.15); margin-bottom: 2rem; }
        .card-title { font-size: 1.5rem; color: #8B4513; margin-bottom: 1.5rem; border-bottom: 2px solid #e6d5c3; padding-bottom: 1rem; }
        .btn-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
        .whatsapp-btn { background: #25D366; color: white; border: none; padding: 1rem 1.5rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.75rem; justify-content: center; }
        .whatsapp-btn:hover { background: #20BA5A; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(37, 211, 102, 0.3); }
        .whatsapp-btn i { font-size: 1.5rem; }
        .preview-box { background: #fffaf0; border-left: 4px solid #25D366; border-radius: 8px; padding: 1.5rem; margin-top: 1rem; font-family: monospace; white-space: pre-wrap; font-size: 0.9rem; line-height: 1.6; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
        .stat-card { background: linear-gradient(135deg, #25D366 0%, #20BA5A 100%); color: white; padding: 1.5rem; border-radius: 15px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; display: block; margin-bottom: 0.5rem; }
        .mock-data { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .mock-title { font-weight: 600; color: #8B4513; margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>📱 WhatsApp Adapter Test</h1>
            <p style="color: #666;">Share Kurukshetra Heritage via WhatsApp</p>
            <div class="badge"><i class="fab fa-whatsapp"></i> WhatsApp Integration Active</div>
        </div>
        
        <div class="stats" id="stats"></div>
        
        <div class="card">
            <h2 class="card-title"><i class="fas fa-share-alt"></i> Share Heritage Sites</h2>
            <div class="mock-data">
                <div class="mock-title">Mock Site Data:</div>
                <div id="mockSite"></div>
            </div>
            <div class="btn-grid">
                <button class="whatsapp-btn" onclick="testShareSite()">
                    <i class="fab fa-whatsapp"></i> Share Brahma Sarovar
                </button>
                <button class="whatsapp-btn" onclick="testShareQuestion()">
                    <i class="fab fa-whatsapp"></i> Share Question
                </button>
            </div>
            <div class="preview-box" id="sitePreview">Click a button to preview message...</div>
        </div>
        
        <div class="card">
            <h2 class="card-title"><i class="fas fa-cloud-sun"></i> Share Live Information</h2>
            <div class="btn-grid">
                <button class="whatsapp-btn" onclick="testShareWeather()">
                    <i class="fab fa-whatsapp"></i> Share Weather
                </button>
                <button class="whatsapp-btn" onclick="testShareEvents()">
                    <i class="fab fa-whatsapp"></i> Share Events
                </button>
                <button class="whatsapp-btn" onclick="testShareDirections()">
                    <i class="fab fa-whatsapp"></i> Share Directions
                </button>
            </div>
        </div>
        
        <div class="card">
            <h2 class="card-title"><i class="fas fa-gift"></i> Share App Invitation</h2>
            <button class="whatsapp-btn" onclick="testShareInvitation()" style="width: 100%;">
                <i class="fab fa-whatsapp"></i> Invite Friends to Kurukshetra Mitra
            </button>
            <div class="preview-box" id="invitationPreview" style="margin-top: 1rem;"></div>
        </div>
        
        <div class="card">
            <h2 class="card-title"><i class="fas fa-tools"></i> Advanced Features</h2>
            <div class="btn-grid">
                <button class="whatsapp-btn" onclick="testCustomMessage()">
                    <i class="fab fa-whatsapp"></i> Custom Message
                </button>
                <button class="whatsapp-btn" onclick="testCopyMessage()">
                    <i class="fas fa-copy"></i> Copy to Clipboard
                </button>
                <button class="whatsapp-btn" onclick="testGenerateUrl()">
                    <i class="fas fa-link"></i> Generate URL
                </button>
            </div>
        </div>
        
        <div class="card">
            <h2 class="card-title"><i class="fas fa-code"></i> Dynamic Share Buttons</h2>
            <p style="color: #666; margin-bottom: 1rem;">Programmatically created share buttons:</p>
            <div id="dynamicButtons" style="display: flex; flex-wrap: wrap; gap: 1rem;"></div>
        </div>
    </div>
    
    <script src="../js/whatsapp-adapter.js"></script>
    <script>
        console.log('🎉 WhatsApp Adapter Test Page Loading...');
        
        // Initialize WhatsApp Adapter
        const whatsapp = WhatsAppAdapter.init({
            baseUrl: 'https://kurukshetra-mitra.com',
            onShare: (data) => {
                console.log('Share event:', data);
                updateStats();
            }
        });
        
        // Mock data
        const mockSite = {
            id: 'brahma-sarovar',
            name: 'Brahma Sarovar',
            description: 'Sacred water tank believed to be created by Lord Brahma. One of Asia\'s largest sacred tanks.',
            location: { address: 'Brahma Sarovar Road, Kurukshetra' },
            timings: 'Open 24 hours',
            entryFee: 'Free'
        };
        
        const mockQuestion = {
            id: 'importance',
            question: 'Why is Kurukshetra important for Hindus?',
            answer: 'Kurukshetra is one of the holiest places in Hinduism where the epic Mahabharata war was fought and Lord Krishna delivered the Bhagavad Gita.'
        };
        
        const mockWeather = {
            temp: 22,
            wind_speed: 3.5,
            humidity: 65
        };
        
        const mockEvents = [
            { title: 'Gita Jayanti', date: '2026-12-21' },
            { title: 'International Gita Mahotsav', date: '2026-12-15' }
        ];
        
        const mockDirections = {
            from: 'Delhi',
            distance: '170 km',
            duration: '3-4 hours'
        };
        
        // Display mock site
        document.getElementById('mockSite').innerHTML = `
            <strong>${mockSite.name}</strong><br>
            ${mockSite.description}<br>
            📍 ${mockSite.location.address}
        `;
        
        // Test functions
        function testShareSite() {
            const message = whatsapp.formatSiteMessage(mockSite);
            document.getElementById('sitePreview').textContent = message;
            whatsapp.shareSite(mockSite);
        }
        
        function testShareQuestion() {
            const message = whatsapp.formatQuestionMessage(mockQuestion);
            document.getElementById('sitePreview').textContent = message;
            whatsapp.shareQuestion(mockQuestion);
        }
        
        function testShareWeather() {
            whatsapp.shareWeather(mockWeather);
        }
        
        function testShareEvents() {
            whatsapp.shareEvents(mockEvents);
        }
        
        function testShareDirections() {
            whatsapp.shareDirections(mockDirections);
        }
        
        function testShareInvitation() {
            const message = whatsapp.formatCustomMessage(
                'Discover the sacred land of Kurukshetra with our digital guide!',
                'https://kurukshetra-mitra.com'
            );
            document.getElementById('invitationPreview').textContent = message;
            whatsapp.shareInvitation();
        }
        
        function testCustomMessage() {
            const message = '🕉️ Visit Kurukshetra, the land of Bhagavad Gita!\n\nExplore 90+ heritage sites with Kurukshetra Mitra.';
            whatsapp.share(message);
        }
        
        async function testCopyMessage() {
            const message = whatsapp.formatSiteMessage(mockSite);
            const success = await whatsapp.copyToClipboard(message);
            alert(success ? 'Message copied to clipboard!' : 'Copy failed!');
        }
        
        function testGenerateUrl() {
            const message = 'Test WhatsApp message';
            const url = whatsapp.generateWhatsAppUrl(message);
            alert(`Generated URL:\n${url}`);
        }
        
        // Create dynamic buttons
        const dynamicButtons = document.getElementById('dynamicButtons');
        
        dynamicButtons.appendChild(
            whatsapp.createSiteShareButton(mockSite, { 
                text: '🗺️ Share Site' 
            })
        );
        
        dynamicButtons.appendChild(
            whatsapp.createQuestionShareButton(mockQuestion, { 
                text: '❓ Share Q&A' 
            })
        );
        
        dynamicButtons.appendChild(
            whatsapp.createShareButton({ 
                text: '🎁 Invite', 
                onClick: testShareInvitation 
            })
        );
        
        function updateStats() {
            const stats = whatsapp.getStats();
            document.getElementById('stats').innerHTML = `
                <div class="stat-card">
                    <span class="stat-number">${stats.totalShares}</span>
                    <span style="font-size: 0.9rem;">Total Shares</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${whatsapp.isWhatsAppAvailable() ? '✅' : '❌'}</span>
                    <span style="font-size: 0.9rem;">WhatsApp Available</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">v${whatsapp.version}</span>
                    <span style="font-size: 0.9rem;">Version</span>
                </div>
            `;
        }
        
        updateStats();
        
        console.log('✅ Test page ready!');
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📱 WHATSAPP ADAPTER LOADED!');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`WhatsApp Available: ${whatsapp.isWhatsAppAvailable()}`);
        console.log('');
        console.log('💡 Features:');
        console.log('   ✅ Share sites');
        console.log('   ✅ Share Q&A');
        console.log('   ✅ Share weather');
        console.log('   ✅ Share events');
        console.log('   ✅ Share directions');
        console.log('   ✅ Invite friends');
        console.log('   ✅ Custom messages');
        console.log('   ✅ Dynamic buttons');
        console.log('');
    </script>
</body>
</html>
