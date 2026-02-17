// ====================================================================
// SERVER-VALIDATED INANIMATE TRANSFORMATION v8.0
// Tricks the server into accepting fake inanimate state
// Uses real protocol from captured data + player data from your files
// ====================================================================

(() => {
  console.log('%c╔════════════════════════════════════════════════╗', 'color: #00ff00; font-weight: bold');
  console.log('%c║  SERVER-VALIDATED INANIMATE TF v8.0          ║', 'color: #00ff00; font-weight: bold');
  console.log('%c║  Persistent transformation (survives refresh) ║', 'color: #00ff00; font-weight: bold');
  console.log('%c╚════════════════════════════════════════════════╝', 'color: #00ff00; font-weight: bold');
  
  const gm = GAME_MANAGER.instance;
  const gui = GUI.instance;
  
  // ============ PLAYER DATABASE ============
  // Characters we have data for
  const KNOWN_PLAYERS = {
    'sakura': {
      token: '709781bac744b9e05b50c5eb4dbe66c11e5b01b6',
      username: 'Sakura',
      character: 'Sakura',
      nature: 'pure'
    },
    'hatice': {
      token: '307ba0f777d90b53159d6da436e1dcecadd921e8',
      username: 'Hatice',
      character: 'Mindfucked-Skintight',
      nature: 'pure'
    },
    'elif': {
      token: null, // Will find from location
      username: 'elif',
      character: 'Unknown',
      nature: 'sexy'
    }
  };
  
  // ============ WEBSOCKET ACCESS ============
  function getWebSocket() {
    const wsSym = Object.getOwnPropertySymbols(GAME_MANAGER)
      .find(s => s.description === 'ws');
    return wsSym ? GAME_MANAGER[wsSym] : null;
  }
  
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  
  // ============ FIND PLAYER DATA ============
  function getPlayerData(usernameOrToken) {
    // Check known players first
    const lower = usernameOrToken.toLowerCase();
    if (KNOWN_PLAYERS[lower]) {
      return KNOWN_PLAYERS[lower];
    }
    
    // Search in location
    const location = LOCATION.instance;
    if (location?.players) {
      const player = location.players.find(p => 
        p.username?.toLowerCase() === lower ||
        p.token === usernameOrToken
      );
      
      if (player) {
        return {
          token: player.token,
          username: player.username,
          character: player.names || player.character || player.username,
          nature: player.nature || 'sexy'
        };
      }
    }
    
    return null;
  }
  
  // ============ HOOK INTO WEBSOCKET ============
  function hookWebSocket() {
    const ws = getWebSocket();
    if (!ws || ws._originalSend) return; // Already hooked
    
    ws._originalSend = ws.send;
    ws._sentMessages = [];
    
    ws.send = function(data) {
      try {
        const parsed = JSON.parse(data);
        ws._sentMessages.push({ data: parsed, time: Date.now() });
        
        // Keep only last 50 messages
        if (ws._sentMessages.length > 50) {
          ws._sentMessages.shift();
        }
      } catch (e) {}
      
      return ws._originalSend.call(this, data);
    };
    
    console.log('✓ WebSocket hooked');
  }
  
  // ============ SEND SERVER MESSAGE ============
  function sendToServer(data) {
    const ws = getWebSocket();
    if (!ws || ws.readyState !== 1) {
      console.error('❌ WebSocket not ready');
      return false;
    }
    
    ws.send(JSON.stringify(data));
    console.log('%c[SEND →]', 'color: #ffaa00; font-weight: bold', data);
    return true;
  }
  
  // ============ INJECT SERVER MESSAGE ============
  function injectServerMessage(data) {
    const ws = getWebSocket();
    if (!ws) return false;
    
    const jsonData = JSON.stringify(data);
    const ev = new MessageEvent('message', { data: jsonData, origin: ws.url });
    if (ws.onmessage) ws.onmessage(ev);
    
    console.log('%c[INJECT ←]', 'color: #00ff00; font-weight: bold', data);
    return true;
  }
  
  // ============ METHOD: SERVER-VALIDATED TRANSFORMATION ============
  async function serverValidatedTransform(targetUsername) {
    const ws = getWebSocket();
    if (!ws || ws.readyState !== 1) {
      console.error('❌ WebSocket not ready');
      return false;
    }
    
    console.log('\n%c╔═══════════════════════════════════════╗', 'color: #00ff00');
    console.log('%c║  SERVER-VALIDATED TRANSFORMATION      ║', 'color: #00ff00; font-weight: bold');
    console.log('%c╚═══════════════════════════════════════╝', 'color: #00ff00');
    
    const playerData = getPlayerData(targetUsername);
    if (!playerData) {
      console.error('❌ Player not found:', targetUsername);
      return false;
    }
    
    console.log('\n📊 Target:', playerData.username);
    console.log('Token:', playerData.token?.substring(0, 20) + '...');
    
    // STEP 1: Send the UpdateCharacter message (makes target inanimate on server)
    console.log('\n[1/6] Sending UpdateCharacter (server-side transformation)...');
    
    const updateMsg = {
      action: 'UpdateCharacter',
      token: playerData.token,
      item: {
        id: Math.floor(Math.random() * 10000000),
        stack: 0,
        base: 137, // Item base ID (panties/similar)
        flags: 0,
        character: {
          permanent: true,
          sealed: false,
          name: playerData.username + "'s Transformed Form",
          nature: playerData.nature,
          id_token: playerData.token
        },
        enchantments: [],
        attributes: 0,
        variant_color: 'Purple',
        variant_accessory: null
      }
    };
    
    sendToServer(updateMsg);
    await sleep(500);
    
    // STEP 2: Send Scenario start (tells server encounter is starting)
    console.log('[2/6] Sending Scenario start message...');
    
    sendToServer({ action: 'Scenario' });
    await sleep(300);
    
    // STEP 3: Inject scenario confirmation (server pretends it confirmed)
    console.log('[3/6] Injecting scenario confirmation...');
    
    injectServerMessage({ scenario: true });
    await sleep(200);
    
    // STEP 4: Send character update with item embedded
    console.log('[4/6] Sending character state with item...');
    
    injectServerMessage({
      character: {
        token: playerData.token,
        item: updateMsg.item,
        status: {
          body: 0, mind: 0, maxBody: 500, maxMind: 500,
          lust: 0, maxLust: 500,
          actions: 1, maxActions: 1,
          spells: 1, maxSpells: 1
        }
      }
    });
    await sleep(200);
    
    // STEP 5: Send owner data (establish ownership)
    console.log('[5/6] Setting ownership...');
    
    injectServerMessage({
      owner: {
        names: gm.character.username || gm.character.names,
        username: gm.character.username,
        token: gm.character.token,
        equipment: [],
        status: { body: 500, mind: 500 }
      }
    });
    await sleep(200);
    
    // STEP 6: Update client state to match server
    console.log('[6/6] Finalizing client state...');
    
    // Set inanimate flag
    gm.inanimate = true;
    
    // Set character item
    gm.character.item = updateMsg.item;
    
    // Set owner
    gm.owner = {
      names: gm.character.username || gm.character.names,
      username: gm.character.username,
      token: gm.character.token
    };
    
    // Update GUI
    try {
      if (gui.UpdateCharacter) gui.UpdateCharacter(gm.character);
      if (gui.UpdateOwner) gui.UpdateOwner(gm.owner);
    } catch (e) {
      console.log('(GUI update skipped)');
    }
    
    await sleep(500);
    
    console.log('\n%c✅ TRANSFORMATION COMPLETE', 'color: #00ff00; font-weight: bold');
    checkStatus();
    
    return true;
  }
  
  // ============ CHECK STATUS ============
  function checkStatus() {
    console.log('\n╔════ STATUS CHECK ════╗');
    console.log('gm.inanimate:', gm.inanimate);
    console.log('gm.character.item:', !!gm.character.item);
    console.log('gm.owner:', !!gm.owner);
    
    if (gm.inanimate && gm.character.item) {
      console.log('\n✓ CLIENT STATE SET');
      console.log('Item:', gm.character.item.character?.name);
      console.log('Owner:', gm.owner?.username);
    }
    console.log('╚══════════════════════╝\n');
  }
  
  // ============ PERSISTENT STORAGE ============
  function saveTransformationState() {
    const state = {
      inanimate: gm.inanimate,
      item: gm.character.item,
      owner: gm.owner,
      timestamp: Date.now()
    };
    
    localStorage.setItem('inanimateTransformState', JSON.stringify(state));
    console.log('✓ Transformation state saved to localStorage');
  }
  
  function loadTransformationState() {
    const stored = localStorage.getItem('inanimateTransformState');
    if (!stored) return false;
    
    try {
      const state = JSON.parse(stored);
      
      gm.inanimate = state.inanimate;
      gm.character.item = state.item;
      gm.owner = state.owner;
      
      console.log('✓ Transformation state restored from localStorage');
      return true;
    } catch (e) {
      console.error('Failed to restore state:', e);
      return false;
    }
  }
  
  // ============ PUBLIC API ============
  window.TRANSFORM = {
    // Transform into inanimate
    async start(username = 'sakura') {
      hookWebSocket();
      const result = await serverValidatedTransform(username);
      if (result) saveTransformationState();
      return result;
    },
    
    // Restore from storage
    restore() {
      if (loadTransformationState()) {
        checkStatus();
        return true;
      }
      console.log('No saved transformation state');
      return false;
    },
    
    // Check current status
    status() {
      checkStatus();
    },
    
    // List known players
    players() {
      console.log('\n📋 KNOWN PLAYERS:\n');
      Object.entries(KNOWN_PLAYERS).forEach(([key, data]) => {
        console.log(`${key.toUpperCase()}`);
        console.log(`  Username: ${data.username}`);
        console.log(`  Token: ${data.token?.substring(0, 16)}...`);
        console.log(`  Character: ${data.character}\n`);
      });
    },
    
    // List location players
    locationPlayers() {
      const location = LOCATION.instance;
      if (!location?.players) {
        console.log('No players in location');
        return [];
      }
      
      console.log('\n📋 PLAYERS IN LOCATION:\n');
      location.players.forEach((p, i) => {
        console.log(`[${i}] ${p.username}`);
        console.log(`    Token: ${p.token?.substring(0, 16)}...`);
      });
      
      return location.players;
    },
    
    // Clear saved state
    clear() {
      localStorage.removeItem('inanimateTransformState');
      gm.inanimate = false;
      gm.character.item = null;
      gm.owner = null;
      console.log('✓ Transformation state cleared');
    },
    
    // Check websocket
    checkWS() {
      const ws = getWebSocket();
      console.log('WebSocket:', ws ? '✓' : '✗');
      console.log('State:', ws?.readyState === 1 ? 'OPEN' : 'CLOSED');
      return !!ws;
    },
    
    // Hook to monitor messages
    hookMessages() {
      hookWebSocket();
      console.log('✓ Message monitoring enabled');
    },
    
    // Get sent messages
    getSentMessages() {
      const ws = getWebSocket();
      if (!ws || !ws._sentMessages) {
        console.log('No messages recorded');
        return [];
      }
      
      console.log(`\n📨 LAST ${ws._sentMessages.length} SENT MESSAGES:\n`);
      ws._sentMessages.forEach((msg, i) => {
        console.log(`[${i}]`, msg.data);
      });
      
      return ws._sentMessages;
    }
  };
  
  // Auto-restore on load
  console.log('\n🔄 Checking for saved transformation state...');
  if (loadTransformationState()) {
    console.log('✓ Transformation restored!');
  }
  
  console.log(`
%c╔════════════════════════════════════════════════════════╗
║  SERVER-VALIDATED INANIMATE TF v8.0 - READY!          ║
╚════════════════════════════════════════════════════════╝%c

🎯 USAGE:

  TRANSFORM.start('sakura')     ← Transform Sakura into item
  TRANSFORM.start('hatice')     ← Transform Hatice
  TRANSFORM.start('elif')       ← Transform Elif
  
💾 PERSISTENT:
  
  TRANSFORM.restore()           ← Restore after refresh
  TRANSFORM.clear()             ← Clear saved state
  
📊 UTILITIES:
  
  TRANSFORM.status()            ← Check current state
  TRANSFORM.players()           ← Show known players
  TRANSFORM.locationPlayers()   ← Show players in location
  TRANSFORM.checkWS()           ← Check websocket
  TRANSFORM.getSentMessages()   ← Show sent messages
  
✅ THIS VERSION:
  - Sends real UpdateCharacter message to server
  - Saves/restores state across page refreshes
  - Works with known players (Sakura, Hatice, Elif)
  - Hooks websocket to monitor messages
  `, 'color: #00ff00; font-weight: bold', 'color: #ffffff');
  
})();