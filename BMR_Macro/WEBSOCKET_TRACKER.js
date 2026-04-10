// ====================================================================
// WEBSOCKET TRANSFORMATION TRACKER
// Comprehensive websocket traffic capture for inanimate transformations
// Logs everything to console AND saves as downloadable JSON
// ====================================================================

(() => {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  WEBSOCKET TRACKER - Full Traffic Capture v1.0    ║');
  console.log('║  Captures ALL websocket data during transformation ║');
  console.log('╚════════════════════════════════════════════════════╝');
  
  // ============ STORAGE ============
  let capturedMessages = [];
  let isTracking = false;
  let trackingStartTime = 0;
  let sessionId = Date.now();
  
  // Store original websocket handlers
  let originalOnMessage = null;
  let originalSend = null;
  
  // ============ GET WEBSOCKET ============
  function getWebSocket() {
    const wsSym = Object.getOwnPropertySymbols(GAME_MANAGER)
      .find(s => s?.description === 'ws');
    return wsSym ? GAME_MANAGER[wsSym] : null;
  }
  
  // ============ PARSE MESSAGE DATA ============
  function parseMessageData(data) {
    try {
      // Handle ArrayBuffer
      if (data instanceof ArrayBuffer) {
        const view = new Uint8Array(data);
        return {
          type: 'ArrayBuffer',
          size: data.byteLength,
          preview: Array.from(view.slice(0, 100)),
          hex: Array.from(view.slice(0, 100)).map(b => b.toString(16).padStart(2, '0')).join(' ')
        };
      }
      
      // Handle Blob
      if (data instanceof Blob) {
        return {
          type: 'Blob',
          size: data.size,
          mimeType: data.type
        };
      }
      
      // Handle string (JSON)
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          return {
            type: 'JSON',
            data: parsed,
            raw: data
          };
        } catch {
          return {
            type: 'String',
            data: data
          };
        }
      }
      
      // Handle array
      if (Array.isArray(data)) {
        return {
          type: 'Array',
          length: data.length,
          data: data
        };
      }
      
      // Handle object
      if (typeof data === 'object') {
        return {
          type: 'Object',
          data: data
        };
      }
      
      // Fallback
      return {
        type: typeof data,
        data: data
      };
    } catch (e) {
      return {
        type: 'Error',
        error: e.message,
        data: String(data).substring(0, 200)
      };
    }
  }
  
  // ============ INSTALL INTERCEPTOR ============
  function installInterceptor() {
    const ws = getWebSocket();
    if (!ws) {
      console.error('❌ [TRACKER] WebSocket not found!');
      return false;
    }
    
    console.log('🔧 [TRACKER] Installing interceptor...');
    
    // Store original handlers
    originalOnMessage = ws.onmessage;
    originalSend = ws.send.bind(ws);
    
    // === INTERCEPT INCOMING MESSAGES ===
    ws.onmessage = function(event) {
      const timestamp = isTracking ? Date.now() - trackingStartTime : 0;
      const parsed = parseMessageData(event.data);
      
      if (isTracking) {
        const messageRecord = {
          session: sessionId,
          timestamp: timestamp,
          direction: 'SERVER → CLIENT',
          parsedData: parsed,
          rawData: event.data,
          capturedAt: new Date().toISOString()
        };
        
        capturedMessages.push(messageRecord);
        
        // Console log with color
        console.log(
          `%c⬇️ [${timestamp}ms] SERVER → CLIENT`,
          'background: #00ff00; color: #000; font-weight: bold; padding: 2px 5px;',
          parsed
        );
      }
      
      // Call original handler
      if (originalOnMessage) {
        originalOnMessage.call(this, event);
      }
    };
    
    // === INTERCEPT OUTGOING MESSAGES ===
    ws.send = function(data) {
      const timestamp = isTracking ? Date.now() - trackingStartTime : 0;
      const parsed = parseMessageData(data);
      
      if (isTracking) {
        const messageRecord = {
          session: sessionId,
          timestamp: timestamp,
          direction: 'CLIENT → SERVER',
          parsedData: parsed,
          rawData: typeof data === 'string' ? data : '[Binary Data]',
          capturedAt: new Date().toISOString()
        };
        
        capturedMessages.push(messageRecord);
        
        // Console log with color
        console.log(
          `%c⬆️ [${timestamp}ms] CLIENT → SERVER`,
          'background: #ffaa00; color: #000; font-weight: bold; padding: 2px 5px;',
          parsed
        );
      }
      
      // Call original send
      return originalSend(data);
    };
    
    console.log('✅ [TRACKER] Interceptor installed successfully!');
    console.log('   WebSocket URL:', ws.url);
    console.log('   Ready State:', ws.readyState, ws.readyState === 1 ? '(OPEN)' : '(NOT OPEN)');
    return true;
  }
  
  // ============ UNINSTALL INTERCEPTOR ============
  function uninstallInterceptor() {
    const ws = getWebSocket();
    if (!ws || !originalOnMessage) {
      console.log('⚠️ [TRACKER] Interceptor not installed or already removed');
      return;
    }
    
    ws.onmessage = originalOnMessage;
    ws.send = originalSend;
    
    originalOnMessage = null;
    originalSend = null;
    
    console.log('🔓 [TRACKER] Interceptor removed');
  }
  
  // ============ DOWNLOAD JSON FILE ============
  function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`💾 Downloaded: ${filename}`);
  }
  
  // ============ GENERATE SUMMARY ============
  function generateSummary() {
    const serverMessages = capturedMessages.filter(m => m.direction === 'SERVER → CLIENT');
    const clientMessages = capturedMessages.filter(m => m.direction === 'CLIENT → SERVER');
    
    const summary = {
      sessionId: sessionId,
      captureStarted: capturedMessages[0]?.capturedAt || 'N/A',
      captureEnded: capturedMessages[capturedMessages.length - 1]?.capturedAt || 'N/A',
      totalDuration: capturedMessages.length > 0 ? 
        capturedMessages[capturedMessages.length - 1].timestamp + 'ms' : '0ms',
      messageCount: {
        total: capturedMessages.length,
        fromServer: serverMessages.length,
        fromClient: clientMessages.length
      },
      messageTypes: {},
      messages: capturedMessages
    };
    
    // Count message types
    capturedMessages.forEach(msg => {
      const type = msg.parsedData?.type || 'Unknown';
      summary.messageTypes[type] = (summary.messageTypes[type] || 0) + 1;
    });
    
    return summary;
  }
  
  // ============ PUBLIC API ============
  window.WS_TRACKER = {
    // Start tracking
    start() {
      if (isTracking) {
        console.warn('⚠️ Already tracking! Call stop() first.');
        return;
      }
      
      if (!installInterceptor()) {
        return;
      }
      
      // Reset capture
      capturedMessages = [];
      sessionId = Date.now();
      trackingStartTime = Date.now();
      isTracking = true;
      
      console.log('');
      console.log('%c╔═══════════════════════════════════════════════════╗', 'color: #00ff00; font-weight: bold');
      console.log('%c║  🔴 TRACKING ACTIVE                               ║', 'color: #00ff00; font-weight: bold');
      console.log('%c║                                                   ║', 'color: #00ff00; font-weight: bold');
      console.log('%c║  🎮 Do your transformation NOW!                   ║', 'color: #00ff00; font-weight: bold');
      console.log('%c║  📝 All websocket traffic is being captured       ║', 'color: #00ff00; font-weight: bold');
      console.log('%c║                                                   ║', 'color: #00ff00; font-weight: bold');
      console.log('%c║  When done: WS_TRACKER.stop()                    ║', 'color: #00ff00; font-weight: bold');
      console.log('%c╚═══════════════════════════════════════════════════╝', 'color: #00ff00; font-weight: bold');
      console.log('');
    },
    
    // Stop tracking
    stop() {
      if (!isTracking) {
        console.warn('⚠️ Not tracking! Call start() first.');
        return;
      }
      
      isTracking = false;
      
      const summary = generateSummary();
      
      console.log('');
      console.log('%c╔═══════════════════════════════════════════════════╗', 'color: #ffaa00; font-weight: bold');
      console.log('%c║  ⏹️ TRACKING STOPPED                              ║', 'color: #ffaa00; font-weight: bold');
      console.log('%c╚═══════════════════════════════════════════════════╝', 'color: #ffaa00; font-weight: bold');
      console.log('');
      console.log('📊 CAPTURE SUMMARY:');
      console.log('   Total messages:', summary.messageCount.total);
      console.log('   From server:', summary.messageCount.fromServer);
      console.log('   From client:', summary.messageCount.fromClient);
      console.log('   Duration:', summary.totalDuration);
      console.log('   Message types:', summary.messageTypes);
      console.log('');
      
      return summary;
    },
    
    // View captured messages
    view() {
      if (capturedMessages.length === 0) {
        console.log('❌ No messages captured yet. Use start() first!');
        return;
      }
      
      console.log(`📋 Captured ${capturedMessages.length} messages:`);
      console.table(capturedMessages.map(m => ({
        Time: `${m.timestamp}ms`,
        Direction: m.direction,
        Type: m.parsedData?.type || 'Unknown',
        Preview: JSON.stringify(m.parsedData?.data || m.parsedData).substring(0, 60) + '...'
      })));
      
      return capturedMessages;
    },
    
    // Download as JSON file
    download() {
      if (capturedMessages.length === 0) {
        console.log('❌ No messages to download. Use start() first!');
        return;
      }
      
      const summary = generateSummary();
      const filename = `transformation_capture_${sessionId}.json`;
      
      downloadJSON(summary, filename);
      
      console.log('');
      console.log('💾 Download complete!');
      console.log('   File:', filename);
      console.log('   Messages:', summary.messageCount.total);
      console.log('');
    },
    
    // Get raw data
    getData() {
      return capturedMessages;
    },
    
    // Get summary
    getSummary() {
      return generateSummary();
    },
    
    // Clear captured data
    clear() {
      const count = capturedMessages.length;
      capturedMessages = [];
      sessionId = Date.now();
      console.log(`🗑️ Cleared ${count} captured messages`);
    },
    
    // Export to clipboard
    copy() {
      if (capturedMessages.length === 0) {
        console.log('❌ No messages to copy. Use start() first!');
        return;
      }
      
      const summary = generateSummary();
      const json = JSON.stringify(summary, null, 2);
      
      // Try to copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(json).then(() => {
          console.log('📋 Copied to clipboard!');
          console.log('   Messages:', summary.messageCount.total);
        }).catch(err => {
          console.error('❌ Clipboard copy failed:', err);
          console.log('📄 JSON OUTPUT (copy manually):');
          console.log(json);
        });
      } else {
        console.log('📄 JSON OUTPUT (copy manually):');
        console.log(json);
      }
      
      return json;
    },
    
    // Uninstall interceptor
    uninstall() {
      isTracking = false;
      uninstallInterceptor();
    },
    
    // Check status
    status() {
      const ws = getWebSocket();
      console.log('📡 TRACKER STATUS:');
      console.log('   Tracking:', isTracking ? '🔴 ACTIVE' : '⚫ INACTIVE');
      console.log('   WebSocket:', ws ? '✅ Available' : '❌ Not found');
      console.log('   Ready State:', ws?.readyState, ws?.readyState === 1 ? '(OPEN)' : '');
      console.log('   Captured messages:', capturedMessages.length);
      console.log('   Interceptor installed:', originalOnMessage ? 'Yes' : 'No');
    },
    
    // Help
    help() {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║  WEBSOCKET TRACKER - QUICK REFERENCE                  ║
╚═══════════════════════════════════════════════════════╝

📋 BASIC WORKFLOW:
  1. WS_TRACKER.start()      ← Start capturing
  2. [Do transformation in game]
  3. WS_TRACKER.stop()       ← Stop capturing
  4. WS_TRACKER.download()   ← Download JSON file

📊 VIEW DATA:
  WS_TRACKER.view()          ← Show table of messages
  WS_TRACKER.getSummary()    ← Get statistics
  WS_TRACKER.getData()       ← Get raw message array

💾 EXPORT:
  WS_TRACKER.download()      ← Download as JSON file
  WS_TRACKER.copy()          ← Copy to clipboard

🔧 UTILITIES:
  WS_TRACKER.status()        ← Check tracker status
  WS_TRACKER.clear()         ← Clear captured data
  WS_TRACKER.uninstall()     ← Remove interceptor
  WS_TRACKER.help()          ← Show this help

The tracker captures ALL websocket traffic including:
  • JSON messages (parsed automatically)
  • Binary data (ArrayBuffer/Blob)
  • Timestamps and direction
  • Full request/response pairs
      `);
    }
  };
  
  // ============ STARTUP MESSAGE ============
  console.log('');
  console.log('✅ WS_TRACKER loaded successfully!');
  console.log('');
  console.log('🚀 QUICK START:');
  console.log('   WS_TRACKER.start()     ← Begin capture');
  console.log('   WS_TRACKER.help()      ← Show all commands');
  console.log('');
  
})();
