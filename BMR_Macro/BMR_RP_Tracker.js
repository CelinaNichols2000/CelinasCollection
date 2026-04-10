// BMR RP Tracker - Zeichnet RP-Nachrichten auf und exportiert sie als formatierte Textdatei
// Verwendung: In der Browser-Console (F12) auf BMR ausführen

(function() {
    'use strict';
    
    const CONFIG = {
        YOUR_CHARACTER_NAME: 'Celina',
        SAVE_DIRECTORY: 'C:\\Users\\PC\\OneDrive\\Dokumente\\BMR_RP_Transcripts',
    };
    
    let isTracking = false;
    let messages = [];
    let sessionStart = null;
    let partnerInfo = null;
    let originalLocalChatMessage = null;
    
    function createUI() {
        const existing = document.getElementById('bmr-tracker-ui');
        if (existing) existing.remove();
        
        const container = document.createElement('div');
        container.id = 'bmr-tracker-ui';
        container.innerHTML = `
            <div class="tracker-row">
                <button id="tracker-start" class="tracker-btn start">● Start</button>
                <button id="tracker-stop" class="tracker-btn stop" disabled>■ Stop</button>
                <span class="tracker-count" id="tracker-count">0</span>
            </div>
            <div class="tracker-row copy-row">
                <button id="copy-1" class="tracker-btn copy" disabled>1</button>
                <button id="copy-2" class="tracker-btn copy" disabled>2</button>
                <button id="copy-3" class="tracker-btn copy" disabled>3</button>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #bmr-tracker-ui {
                position: fixed;
                top: 3px;
                left: 40%;
                transform: translateX(-50%);
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 4px;
                background: rgba(0, 0, 0, 0.85);
                padding: 4px 8px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .tracker-row {
                display: flex;
                gap: 6px;
                align-items: center;
                justify-content: center;
            }
            .copy-row {
                gap: 5px;
            }
            .tracker-btn {
                padding: 4px 10px;
                border: none;
                border-radius: 3px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                color: white;
            }
            .tracker-btn.start { background: #10b981; }
            .tracker-btn.start:hover:not(:disabled) { background: #059669; }
            .tracker-btn.stop { background: #ef4444; }
            .tracker-btn.stop:hover:not(:disabled) { background: #dc2626; }
            .tracker-btn.copy { 
                background: #3b82f6;
                min-width: 28px;
                padding: 4px 8px;
            }
            .tracker-btn.copy:hover:not(:disabled) { background: #2563eb; }
            .tracker-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            .tracker-count {
                color: white;
                font-size: 11px;
                font-weight: 700;
                min-width: 26px;
                text-align: right;
                padding: 3px 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            .tracker-count.recording {
                background: rgba(16, 185, 129, 0.3);
                animation: pulse 2s ease-in-out infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(container);
        
        document.getElementById('copy-1').addEventListener('click', () => copyLastPartnerMessages(1));
        document.getElementById('copy-2').addEventListener('click', () => copyLastPartnerMessages(2));
        document.getElementById('copy-3').addEventListener('click', () => copyLastPartnerMessages(3));
        document.getElementById('tracker-start').addEventListener('click', startTracking);
        document.getElementById('tracker-stop').addEventListener('click', stopTracking);
    }
    
    function getPartnerInfo() {
        try {
            if (typeof GAME_MANAGER !== 'undefined' && GAME_MANAGER.instance?.opponent) {
                const opp = GAME_MANAGER.instance.opponent;
                if (opp.character?.name || opp.name || opp.username) {
                    return {
                        username: opp.username || opp.character?.username || opp.name || 'Unknown',
                        characterName: opp.character?.name || opp.name || opp.username || 'Unknown',
                        token: opp.token || opp.character?.token
                    };
                }
            }
            
            if (typeof CHARACTER_MANAGER !== 'undefined') {
                const characters = CHARACTER_MANAGER.characters || [];
                for (const char of characters) {
                    if (char.name !== CONFIG.YOUR_CHARACTER_NAME && char.name) {
                        return { username: char.username || char.name, characterName: char.name, token: char.token };
                    }
                }
            }
            
            if (typeof ROOM !== 'undefined' && ROOM.opponent) {
                const opp = ROOM.opponent;
                return { username: opp.username || opp.name || 'Unknown', characterName: opp.name || opp.username || 'Unknown', token: opp.token };
            }
        } catch (error) {
            console.error('[BMR Tracker] Error:', error);
        }
        return null;
    }
    
    function hookTextLog() {
        if (typeof TEXT_LOG === 'undefined' || !TEXT_LOG.instance) {
            setTimeout(hookTextLog, 500);
            return;
        }
        
        originalLocalChatMessage = TEXT_LOG.instance.LocalChatMessage;
        
        TEXT_LOG.instance.LocalChatMessage = function(chatData, yourUsername, owner) {
            const result = originalLocalChatMessage.apply(this, arguments);
            
            if (isTracking && chatData?.message && (chatData.channel === 0 || chatData.channel === undefined)) {
                const isYourMessage = chatData.sender === yourUsername || !chatData.sender || chatData.sender === CONFIG.YOUR_CHARACTER_NAME;
                captureMessage(chatData.sender || 'Unknown', chatData.message, isYourMessage);
            }
            
            return result;
        };
    }
    
    function captureMessage(sender, text, isYourMessage) {
        if (!text || typeof text !== 'string') return;
        
        let author;
        if (isYourMessage) {
            author = CONFIG.YOUR_CHARACTER_NAME;
        } else {
            if (!partnerInfo) partnerInfo = { username: sender, characterName: sender, token: null };
            author = partnerInfo.characterName;
        }
        
        messages.push({ author, text: text.trim(), timestamp: new Date() });
        updateMessageCount();
    }
    
    function updateMessageCount() {
        const countElement = document.getElementById('tracker-count');
        if (countElement) countElement.textContent = messages.length;
        
        const partnerMessages = messages.filter(m => m.author !== CONFIG.YOUR_CHARACTER_NAME);
        document.getElementById('copy-1').disabled = partnerMessages.length < 1;
        document.getElementById('copy-2').disabled = partnerMessages.length < 2;
        document.getElementById('copy-3').disabled = partnerMessages.length < 3;
    }
    
    function copyLastPartnerMessages(count) {
        const partnerMessages = messages.filter(m => m.author !== CONFIG.YOUR_CHARACTER_NAME);
        
        if (partnerMessages.length < count) {
            alert('⚠️ Keine Partner-Nachricht an dieser Position!');
            return;
        }
        
        const message = partnerMessages[partnerMessages.length - count];
        const textToCopy = message.text;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const btn = document.getElementById(`copy-${count}`);
            const originalText = btn.textContent;
            btn.textContent = '✓';
            setTimeout(() => { btn.textContent = originalText; }, 1500);
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('❌ Kopieren fehlgeschlagen!');
        });
    }
    
    function startTracking() {
        if (isTracking) return;
        
        isTracking = true;
        sessionStart = new Date();
        messages = [];
        partnerInfo = getPartnerInfo();
        
        document.getElementById('tracker-start').disabled = true;
        document.getElementById('tracker-stop').disabled = false;
        document.getElementById('tracker-count').classList.add('recording');
        updateMessageCount();
    }
    
    function stopTracking() {
        if (!isTracking) return;
        
        isTracking = false;
        document.getElementById('tracker-start').disabled = false;
        document.getElementById('tracker-stop').disabled = true;
        document.getElementById('tracker-count').classList.remove('recording');
        
        if (messages.length > 0) downloadTranscript();
        else alert('⚠️ Keine Nachrichten aufgezeichnet!');
    }
    
    function formatTime(date) {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
    
    function calculateDuration() {
        if (!sessionStart || messages.length === 0) return 'N/A';
        
        const lastMessage = messages[messages.length - 1].timestamp;
        const durationMs = lastMessage - sessionStart;
        const hours = Math.floor(durationMs / 3600000);
        const minutes = Math.floor((durationMs % 3600000) / 60000);
        
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }
    
    function generateTranscript() {
        const partnerName = partnerInfo?.characterName || 'Unknown';
        const username = partnerInfo?.username || 'Unknown';
        
        const header = `
================================================================================
                          ROLEPLAY TRANSCRIPT
================================================================================

Encounter:          ${CONFIG.YOUR_CHARACTER_NAME} & ${partnerName}
Username:           ${username}
Datum:              ${formatDate(sessionStart)}
Uhrzeit:            ${formatTime(sessionStart)}
Nachrichten:        ${messages.length}
Dauer:              ${calculateDuration()}

================================================================================

`;
        
        let content = '';
        messages.forEach((msg, index) => {
            if (index > 0) content += '\n';
            content += `${msg.author}: ${msg.text}\n`;
        });
        
        const footer = `
================================================================================
                          END OF TRANSCRIPT
================================================================================
Erstellt am ${formatDate(new Date())} um ${formatTime(new Date())} Uhr
`;
        
        return header + content + footer;
    }
    
    async function downloadTranscript() {
        const transcript = generateTranscript();
        const partnerName = partnerInfo?.characterName || 'Unknown';
        const dateStr = formatDate(sessionStart).replace(/\./g, '-');
        const timeStr = formatTime(sessionStart).replace(/:/g, '-');
        const filename = `RP_${CONFIG.YOUR_CHARACTER_NAME}_${partnerName}_${dateStr}_${timeStr}.txt`;
        
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt'] } }]
            });
            
            const writable = await handle.createWritable();
            await writable.write(transcript);
            await writable.close();
            
            alert(`✅ Transcript gespeichert!\n\n📁 ${filename}\n📊 ${messages.length} Nachrichten\n⏱️ ${calculateDuration()}`);
        } catch (error) {
            if (error.name === 'AbortError') return;
            
            const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    createUI();
    hookTextLog();
    console.log('[BMR Tracker] Bereit!');
})();