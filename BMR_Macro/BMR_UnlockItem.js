// ====================================================================
// BMR_UnlockItem.js - Inanimate Turn-Back Script v3.0
// ====================================================================
// HOW TO USE:
//   1. Paste this entire file into the browser console (F12) and press Enter
//   2. Then call:  UNLOCK.run()
//
// COMMANDS:
//   UNLOCK.run()          ← Full auto sequence (tries everything)
//   UNLOCK.status()       ← Show your current inanimate state
//   UNLOCK.monitor()      ← Watch all WS traffic to see server responses
//   UNLOCK.helperCommand() ← ★ REAL SOLUTION: get command for a helper player to run
//   UNLOCK.turnBack()     ← Run this after helper does the NPC unlock
//   UNLOCK.clientReset()  ← Nuclear: reset state client-side only
//   UNLOCK.npcUnlock()    ← NPC ward nurse unlock (server blocks this FROM YOUR account)
// ====================================================================

(() => {
  'use strict';

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ─────────────────────────────────────────────
  // WEBSOCKET – RAW ACCESS
  // gm.Send() has a client-side inanimate guard that blocks Crafting/etc.
  // We bypass it entirely by sending directly on the raw WebSocket.
  // ─────────────────────────────────────────────

  function getWS() {
    // Primary: symbol-hidden _ws inside GameManager closure
    const sym = Object.getOwnPropertySymbols(GAME_MANAGER)
      .find(s => s && s.description === 'ws');
    if (sym && GAME_MANAGER[sym] && GAME_MANAGER[sym].readyState === 1) {
      return GAME_MANAGER[sym];
    }
    // Fallback: scan all symbol slots
    for (const s of Object.getOwnPropertySymbols(GAME_MANAGER)) {
      try {
        const v = GAME_MANAGER[s];
        if (v && v.readyState === 1 && typeof v.send === 'function') return v;
      } catch (_) { /* ignore */ }
    }
    return null;
  }

  // Always sends via raw WebSocket — bypasses gm.Send and any Proxy wrappers
  function sendRaw(payload) {
    const ws = getWS();
    if (!ws) {
      console.error('[UNLOCK] ❌ WebSocket not found! Are you on the game page?');
      return false;
    }
    const msg = JSON.stringify(payload);
    ws.send(msg);
    console.log('%c[UNLOCK → RAW WS]', 'color:#ff6600;font-weight:bold', payload);
    return true;
  }

  // Injects a fake server→client message so the game processes it locally
  function injectFromServer(data) {
    const ws = getWS();
    if (!ws) { console.warn('[UNLOCK] Cannot inject - no WS'); return false; }
    const msg = JSON.stringify(data);
    const ev = new MessageEvent('message', { data: msg });
    if (ws.onmessage) ws.onmessage(ev);
    console.log('%c[UNLOCK ← INJECT]', 'color:#00ff88;font-weight:bold', data);
    return true;
  }

  // ─────────────────────────────────────────────
  // WS MONITOR — watch server responses
  // ─────────────────────────────────────────────

  let _monitorActive = false;
  let _origOnMessage = null;

  function startMonitor() {
    if (_monitorActive) { console.log('[UNLOCK] Monitor already active'); return; }
    const ws = getWS();
    if (!ws) { console.error('[UNLOCK] No WS to monitor'); return; }
    _origOnMessage = ws.onmessage;
    ws.onmessage = async function(ev) {
      const raw = ev.data instanceof ArrayBuffer ? '[ArrayBuffer]' : ev.data;
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          console.log('%c[WS IN]', 'color:#00ff88;font-weight:bold', parsed);
        } catch (_) {
          console.log('%c[WS IN RAW]', 'color:#00ff88', raw);
        }
      } else {
        console.log('%c[WS IN BIN]', 'color:#888888', raw);
      }
      if (_origOnMessage) return _origOnMessage.call(this, ev);
    };
    _monitorActive = true;
    console.log('%c[UNLOCK] ✅ WS monitor active — all server messages will be logged', 'color:#00ff88;font-weight:bold');
  }

  function stopMonitor() {
    if (!_monitorActive) return;
    const ws = getWS();
    if (ws && _origOnMessage) ws.onmessage = _origOnMessage;
    _monitorActive = false;
    _origOnMessage = null;
    console.log('[UNLOCK] Monitor stopped');
  }

  // ─────────────────────────────────────────────
  // STATE HELPERS
  // ─────────────────────────────────────────────

  function getState() {
    const gm = GAME_MANAGER.instance;
    const char = gm?.character;
    const item = char?.item;
    return {
      gm, char, item,
      // NOTE: gm.inanimate is a READ-ONLY getter = !!_character.item
      // To clear it, mutate _character.item via gm.character.item = null
      isInanimate: !!gm?.inanimate,
      itemId: item?.id ?? null,
      itemName: item?.character?.name ?? item?.base?.item_name ?? '(unknown)',
      isPermanent: !!item?.character?.permanent,
      isSealed: !!item?.character?.sealed,
      ownerToken: gm?.owner?.token ?? null,
      ownerName: gm?.owner?.username ?? gm?.owner?.names ?? '(none)',
      myToken: char?.token ?? null,
    };
  }

  function printStatus() {
    const s = getState();
    console.log('%c══════════ UNLOCK STATUS ══════════', 'color:#00ccff;font-weight:bold');
    console.log('  Is inanimate :', s.isInanimate);
    console.log('  Item ID      :', s.itemId);
    console.log('  Item name    :', s.itemName);
    console.log('  Permanent    :', s.isPermanent);
    console.log('  Sealed       :', s.isSealed);
    console.log('  Owner        :', s.ownerName, '|', s.ownerToken ?? 'none');
    console.log('  Your token   :', s.myToken);
    console.log('%c═══════════════════════════════════', 'color:#00ccff;font-weight:bold');
    return s;
  }

  // ─────────────────────────────────────────────
  // OWNER SESSION UNLOCK
  // Dev-authorized: open a second WS connection authenticated as the owner,
  // send the NPC unlock from that connection, then close it.
  // Call: UNLOCK.ownerUnlock({ username: '...', token: '...', id_token: '...' })
  //   or: UNLOCK.ownerUnlock('paste_whatever_dev_gave_you_here')
  // ─────────────────────────────────────────────

  async function ownerUnlock(ownerSession) {
    const itemId = getState().itemId || 6057885;

    // Accept a raw string (id_token) or a session object
    let session;
    if (typeof ownerSession === 'string') {
      // Try parsing as JSON first, otherwise treat as bare id_token
      try { session = JSON.parse(ownerSession); }
      catch (_) { session = { id_token: ownerSession }; }
    } else {
      session = ownerSession || {};
    }

    console.log('%c[OWNER] Opening authenticated WS connection as owner...', 'color:#ff9900;font-weight:bold');
    console.log('[OWNER] Session keys:', Object.keys(session));
    console.log('[OWNER] itemId:', itemId);

    const wsUrl = (() => {
      // Derive WS URL from the existing connection
      const existing = getWS();
      if (existing && existing.url) return existing.url;
      // Fallback: construct from API_HOST
      const host = GAME_MANAGER.API_HOST?.replace('https://', '').replace('http://', '') || 'battlemageserotica.com';
      return `wss://${host}/ws`;
    })();

    console.log('[OWNER] WS URL:', wsUrl);

    return new Promise((resolve) => {
      let done = false;
      const ownerWS = new WebSocket(wsUrl);
      ownerWS.binaryType = 'arraybuffer';

      const finish = (msg, ok) => {
        if (done) return;
        done = true;
        console.log(ok
          ? `%c[OWNER] ✅ ${msg}` : `%c[OWNER] ❌ ${msg}`,
          ok ? 'color:#00ff88;font-weight:bold' : 'color:#ff4444;font-weight:bold');
        try { ownerWS.close(); } catch (_) {}
        resolve(ok);
      };

      const timeout = setTimeout(() => finish('Timed out after 15s', false), 15000);

      ownerWS.onopen = function() {
        console.log('%c[OWNER] WS open — authenticating as owner...', 'color:#ffff00');
        // Session format: { username, auth_token, timestamp }
        // WS handshake: Object.assign({}, session, { id_token: auth_token, relog, origin_timestamp, device_id })
        const deviceId = localStorage.getItem('_deviceId') || localStorage.getItem('device_id') || '';
        // auth_token and id_token are the same value (auth_token is stored in session, id_token is sent in WS)
        const authToken = session.auth_token || session.id_token || session.token || '';
        const auth = Object.assign({
          origin_timestamp: Date.now(),
          device_id: deviceId,
          relog: true,
        }, session, {
          id_token: authToken,  // must be explicitly set — GameManager does this from _idToken (URL param)
          auth_token: authToken,
        });
        console.log('[OWNER] Auth payload keys:', Object.keys(auth));
        console.log('[OWNER] username:', auth.username, '| auth_token present:', !!authToken);
        ownerWS.send(JSON.stringify(auth));
      };

      let step = 0;
      ownerWS.onmessage = function(ev) {
        let decoded;
        try {
          if (ev.data instanceof ArrayBuffer) {
            decoded = JSON.parse(pako.inflate(new Uint8Array(ev.data), { to: 'string' }));
          } else {
            decoded = JSON.parse(ev.data);
          }
        } catch (_) {
          decoded = ev.data;
        }
        console.log('%c[OWNER WS IN]', 'color:#00ccff;font-weight:bold', decoded);

        if (decoded && decoded.message) {
          finish(`Server said: ${decoded.message}`, false);
          clearTimeout(timeout);
          return;
        }

        step++;
        if (step === 1) {
          // First real response = we're authenticated. Send Location → ward.
          console.log('%c[OWNER] Authenticated! Sending Location: ward...', 'color:#ffff00');
          ownerWS.send(JSON.stringify({ action: 'Location', menu: 'ward' }));
        } else if (step === 2) {
          // Location acked. Send NPC unlock.
          console.log('%c[OWNER] Sending NPC unlock (optionId:29)...', 'color:#ff9900');
          ownerWS.send(JSON.stringify({ action: 'Crafting', itemId, optionId: 29, npc: true }));
        } else if (step === 3) {
          // Also try optionId 27
          ownerWS.send(JSON.stringify({ action: 'Crafting', itemId, optionId: 27, npc: true }));
          clearTimeout(timeout);
          setTimeout(() => {
            finish('NPC unlock sent! Now run UNLOCK.turnBack() on your inanimate account.', true);
          }, 1000);
        }
      };

      ownerWS.onerror = function(e) {
        clearTimeout(timeout);
        finish(`WS error: ${e.message || 'connection failed'}`, false);
      };
      ownerWS.onclose = function(e) {
        if (!done) {
          clearTimeout(timeout);
          finish(`WS closed early (code ${e.code})`, false);
        }
      };
    });
  }

  // ─────────────────────────────────────────────
  // APPROACH 1: NPC WARD NURSE UNLOCK
  // Uses raw WS to bypass gm.Send's inanimate guard.
  // optionId:29 = nurse unlock (removes permanent + frees item)
  // ─────────────────────────────────────────────

  async function npcUnlock() {
    const s = getState();
    if (!s.itemId) {
      console.warn('[UNLOCK] npcUnlock: no item ID — are you inanimate?');
      return false;
    }
    console.log('%c[UNLOCK] Trying NPC ward nurse unlock via raw WS...', 'color:#ff9900');
    console.log('[UNLOCK] item ID:', s.itemId);

    // Step 1: Tell server we are at the ward (raw WS — bypasses inanimate guard)
    sendRaw({ action: 'Location', menu: 'ward' });
    await sleep(400);

    // Step 2: NPC nurse unlock — optionId:29 removes permanence and frees you
    sendRaw({ action: 'Crafting', itemId: s.itemId, optionId: 29, npc: true });
    await sleep(700);

    // Step 3: Also try optionId:27 (alternative remove-permanence seen in some server versions)
    sendRaw({ action: 'Crafting', itemId: s.itemId, optionId: 27, npc: true });
    await sleep(400);

    // Step 4: Refresh menu to see updated state
    sendRaw({ action: 'Menu', menu: 'yourself' });
    await sleep(300);

    console.log('%c[UNLOCK] NPC unlock sent via raw WS. Check monitor for server response.', 'color:#ffcc00');
    return true;
  }

  // ─────────────────────────────────────────────
  // APPROACH 2A: FORM ESCAPE
  // Escape is the intended path for permanent+sealed=false items.
  // Requires owner to have been offline for 7+ days.
  // After a successful escape you become an unowned stray item.
  // Then ANY player (incl. helper) can NPC-unlock you at the ward
  // without needing to own you first.
  // ─────────────────────────────────────────────

  async function tryEscape() {
    startMonitor();
    console.log('%c[UNLOCK] Trying Form escape...', 'color:#ff9900');
    console.log('[UNLOCK] This requires owner offline 7+ days. sealed=false so it should be allowed.');
    console.log('[UNLOCK] If too early, server will tell us how long to wait.');
    sendRaw({ action: 'Form', escape: true });
    await sleep(1200);
    const after = getState();
    if (!after.isInanimate && !after.itemId) {
      console.log('%c✓ ESCAPED! You are free from Max_The_Catgirl!', 'color:#00ff88;font-weight:bold');
      console.log('%c  Now have your helper run UNLOCK.helperCommand() to NPC-unlock the stray item.', 'color:#ffffff');
    } else {
      console.log('%c[UNLOCK] Check [WS IN] above — server will say how long until escape is allowed.', 'color:#ffaa00');
    }
    return after;
  }

  // ─────────────────────────────────────────────
  // APPROACH 2B: CLEAR PERMANENT + FORM TURN BACK
  // The server rejected turnBack because permanent=true.
  // We first clear the permanent flag on the item, then try again.
  // Also sent via raw WS to bypass the inanimate guard.
  // ─────────────────────────────────────────────

  async function formTurnBack() {
    const s = getState();
    console.log('%c[UNLOCK] Attempting Form turnBack...', 'color:#ff9900');

    // 1. Clear permanent + sealed flags on the local item object
    //    (gm.character is the same _character reference — mutation works)
    if (s.item?.character) {
      s.item.character.permanent = false;
      s.item.character.sealed = false;
      console.log('[UNLOCK] Cleared permanent + sealed flags on local item');
    }
    await sleep(200);

    // 2. Send Form turnBack via raw WS (bypasses gm.Send inanimate guard)
    sendRaw({ action: 'Form', turnBack: true });
    await sleep(600);

    // 3. Try with giveIn:false as well (some server versions require this)
    sendRaw({ action: 'Form', turnBack: true, giveIn: false });
    await sleep(400);

    return true;
  }

  // ─────────────────────────────────────────────
  // APPROACH 3: NUCLEAR CLIENT-SIDE RESET
  // gm.inanimate is a GETTER: () => !!_character.item
  // We cannot set gm.inanimate directly.
  // But gm.character returns _character by reference, so
  // gm.character.item = null DOES make gm.inanimate return false.
  // ─────────────────────────────────────────────

  async function clientReset() {
    console.log('%c[UNLOCK] NUCLEAR: Clearing inanimate state client-side...', 'color:#ff4444;font-weight:bold');
    const gm = GAME_MANAGER.instance;
    const char = gm?.character;

    // 1. Null out the item on the character object
    //    gm.inanimate = !!_character.item, so this makes inanimate → false
    if (char) {
      char.item = null;
      console.log('[UNLOCK] ✓ char.item = null → gm.inanimate is now:', gm.inanimate);

      // 2. Restore status to normal
      if (char.status) {
        char.status.body = char.status.maxBody || 500;
        char.status.mind = char.status.maxMind || 500;
        char.status.lust = 0;
        char.status.roleplaying = false;
      }
    }

    // 3. Clear owner reference
    try {
      // _owner is inside closure — inject a server message to clear it
      injectFromServer({ owner: null });
      await sleep(100);
    } catch (_) { /* best effort */ }

    // 4. Inject server messages to force game state update
    const myToken = char?.token;
    if (myToken) {
      // Tell game: your character has no item
      injectFromServer([myToken, { character: { item: null } }]);
      await sleep(200);
      // Tell game: refresh your own menu
      injectFromServer({ menu: { refresh: 'yourself' } });
      await sleep(200);
    }

    // 5. Force UI refresh via raw WS and game methods
    sendRaw({ action: 'Menu', menu: 'yourself' });
    await sleep(400);
    try { LOCATION.instance?.Reload?.(); } catch (_) {}
    await sleep(300);
    try { GUI.instance?.RefreshMenu?.(); } catch (_) {}
    await sleep(200);
    try { MENU?.Myself?.Redraw?.(); } catch (_) {}
    try { ACTION_BAR?.RedrawInanimateActions?.(); } catch (_) {}

    console.log('%c[UNLOCK] ✅ Client reset complete.', 'color:#00ff88;font-weight:bold');
    console.log('[UNLOCK] gm.inanimate is now:', gm.inanimate);
    console.log('[UNLOCK] ⚠ This is client-side only. Server still has you as inanimate.');
    console.log('[UNLOCK] After this, run UNLOCK.npcUnlock() to make the server agree.');
  }

  // ─────────────────────────────────────────────
  // WHY npcUnlock() FAILS: ROOT CAUSE
  // The server checks YOUR character's inanimate state before processing
  // ANY Crafting or Location action. Since you ARE the inanimate item,
  // every Crafting request you send is rejected server-side regardless of
  // how you send it (raw WS, gm.Send, etc.).
  //
  // The NPC unlock was designed for the OWNER to use (from their account)
  // on an item in their inventory — not for the item to use on itself.
  //
  // REAL SOLUTION: Ask ANY other non-inanimate player to run the
  // UNLOCK.helperCommand() output in their console while at the ward.
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // HELPER COMMAND GENERATOR
  // Generates the exact command a helper player needs to paste in
  // THEIR console (while at the ward) to NPC-unlock you.
  // They do NOT need this script — just the one-liner printed below.
  // ─────────────────────────────────────────────

  function helperCommand() {
    const itemId = getState().itemId || 6057885;

    console.log('');
    console.log('%c════════════════════════════════════════════════════════', 'color:#ffff00;font-weight:bold');
    console.log('%c  HELPER ACCOUNT: copy the line below and paste in console', 'color:#ffffff;font-weight:bold');
    console.log('%c════════════════════════════════════════════════════════', 'color:#ffff00;font-weight:bold');
    console.log('');

    // Single-line script — safe to copy/paste directly into console
    const script = `(()=>{const ws=(()=>{const sym=Object.getOwnPropertySymbols(GAME_MANAGER).find(s=>s&&s.description==='ws');if(sym&&GAME_MANAGER[sym]&&GAME_MANAGER[sym].readyState===1)return GAME_MANAGER[sym];for(const s of Object.getOwnPropertySymbols(GAME_MANAGER)){try{const v=GAME_MANAGER[s];if(v&&v.readyState===1&&typeof v.send==='function')return v;}catch(_){}}return null;})();if(!ws){console.error('NO WS!');return;}const tryDecode=d=>{if(typeof d==='string'){try{return JSON.parse(d);}catch(_){return d;}}if(d instanceof ArrayBuffer){try{const s=pako.inflate(new Uint8Array(d),{to:'string'});return JSON.parse(s);}catch(_){return '[binary '+d.byteLength+'b]';}}return d;};const orig=ws.onmessage;ws.onmessage=function(ev){const decoded=tryDecode(ev.data);console.log('%c[H IN]','color:#00ff88;font-weight:bold',decoded);return orig&&orig.call(this,ev);};console.log('%c[HELPER] Monitor on (binary+json)','color:#00ff88;font-weight:bold');GAME_MANAGER.instance.Send('Location',{menu:'ward'});setTimeout(()=>{console.log('%c[HELPER] Sending NPC unlock...','color:#ff9900');GAME_MANAGER.instance.Send('Crafting',{itemId:${itemId},optionId:29,npc:true});setTimeout(()=>{GAME_MANAGER.instance.Send('Crafting',{itemId:${itemId},optionId:27,npc:true});console.log('%c[HELPER] Done. Check [H IN] above. No error msg = likely worked!','color:#ffff00');console.log('[HELPER] If worked -> inanimate player runs: UNLOCK.turnBack()');},1000);},800);})();`;

    console.log(script);
    console.log('');
    console.log('%c════════════════════════════════════════════════════════', 'color:#ffff00;font-weight:bold');
    console.log('%c  After pasting: watch for [H IN] messages.', 'color:#ffffff');
    console.log('%c  If it says success -> YOU run: UNLOCK.turnBack()', 'color:#ffffff');
    console.log('%c  If it says "not your item" -> run UNLOCK.claimScript()', 'color:#ffffff');
    console.log('%c════════════════════════════════════════════════════════', 'color:#ffff00;font-weight:bold');
    console.log('');
    return script;
  }

  // ─────────────────────────────────────────────
  // CLAIM SCRIPT FOR HELPER ACCOUNT
  // The ward NPC unlock requires the SENDER to be the item's owner.
  // Max_The_Catgirl owns item 6057885.  The helper account is not the owner.
  // This generates a script for the HELPER to paste that attempts to claim
  // ownership of the item (pick it up / adopt it as a stray), then NPC unlock.
  // ─────────────────────────────────────────────

  function claimScript() {
    const itemId = getState().itemId || 6057885;
    // Single-line script — safe to copy/paste directly into console
    const script = `(()=>{const gm=GAME_MANAGER.instance;const ws=(()=>{const sym=Object.getOwnPropertySymbols(GAME_MANAGER).find(s=>s&&s.description==='ws');if(sym&&GAME_MANAGER[sym]&&GAME_MANAGER[sym].readyState===1)return GAME_MANAGER[sym];return null;})();if(!ws){console.error('NO WS');return;}const orig=ws.onmessage;ws.onmessage=function(ev){if(typeof ev.data==='string'){try{console.log('%c[H IN]','color:#00ff88;font-weight:bold',JSON.parse(ev.data));}catch(_){}}return orig&&orig.call(this,ev);};console.log('%c[CLAIM] Monitor on','color:#00ff88');const send=obj=>(console.log('%c[CLAIM->]','color:#ff9900',obj),ws.send(JSON.stringify(obj)));send({action:'Location',menu:'ward'});setTimeout(()=>{send({action:'Crafting',itemId:${itemId},optionId:29,npc:true});},700);setTimeout(()=>{send({action:'Item',itemId:${itemId},itemAction:'PickUp'});},1500);setTimeout(()=>{send({action:'Item',itemId:${itemId},itemAction:'Rescue'});send({action:'Item',itemId:${itemId},itemAction:'Adopt'});send({action:'Item',itemId:${itemId},itemAction:'Claim'});},2300);setTimeout(()=>{const t=gm.character&&gm.character.token;if(t)send({action:'GiveItemTo',itemId:${itemId},token:t});},3200);setTimeout(()=>{console.log('%c[CLAIM] Done - check [H IN] lines above for server responses','color:#ffff00');},4000);})();`;

    console.log('');
    console.log('%c═══════════════════════════════════════════════════════', 'color:#ff9900;font-weight:bold');
    console.log('%c  HELPER ACCOUNT: copy the line below, paste in console', 'color:#ffffff;font-weight:bold');
    console.log('%c═══════════════════════════════════════════════════════', 'color:#ff9900;font-weight:bold');
    console.log('');
    console.log(script);
    console.log('');
    console.log('%c  After pasting: check the [H IN] lines for server responses.', 'color:#ffffff');
    console.log('%c  If any succeed -> run UNLOCK.turnBack() on the inanimate account.', 'color:#ffffff');
    console.log('%c═══════════════════════════════════════════════════════', 'color:#ff9900;font-weight:bold');
    console.log('');
    return script;
  }

  // ─────────────────────────────────────────────
  // APPROACH 4: INANIMATE SPELL ACTIONS
  // Items can cast spells on their wearer via PerformInanimateAction().
  // This goes through performSpellAction → WaitFor("Spell") → internal
  // send() — a DIFFERENT code path from gm.Send(). The server may allow
  // Spell actions from inanimate items (they are a designed mechanic).
  // Some items have a self-release action that removes the transformation.
  // ─────────────────────────────────────────────

  function inspectActions() {
    const gm = GAME_MANAGER.instance;
    const item = gm?.character?.item;
    if (!item) {
      console.warn('[UNLOCK] inspectActions: item is null. Are you inanimate?');
      return;
    }
    console.log('%c══ INANIMATE ACTIONS ON YOUR ITEM ══', 'color:#00ccff;font-weight:bold');
    console.log('Item:', item?.character?.name ?? item?.base?.item_name, '| id:', item?.id);
    const actions = Array.isArray(item.inanimate_actions) ? item.inanimate_actions : [];
    if (actions.length === 0) {
      console.log('%c  No inanimate_actions found on item.', 'color:#ffaa00');
    } else {
      actions.forEach((a, i) => console.log(`  [${i}] id:${a.id} name:"${a.actionname ?? a.label ?? '?'}" cost:${a.spell_cost ?? 0} tags:${JSON.stringify(a.tags)}`));
    }
    // Also check via ACTION helper which includes reaction bar actions
    try {
      const all = ACTION.GetInanimateActions(true);
      console.log('%c══ ALL inanimate actions (incl. reactions) ══', 'color:#00ccff');
      all.forEach((a, i) => console.log(`  [${i}] id:${a.id} name:"${a.actionname ?? a.label ?? '?'}" disabled:${!!a.disabled} tags:${JSON.stringify(a.tags)}`));
    } catch (e) { console.warn('[UNLOCK] ACTION.GetInanimateActions error:', e); }
    console.log('%c════════════════════════════════════════', 'color:#00ccff;font-weight:bold');
    console.log('To cast one: UNLOCK.castInanimateAction(id)');
  }

  async function castInanimateAction(id) {
    console.log(`%c[UNLOCK] Casting inanimate action id:${id} via PerformInanimateAction...`, 'color:#ff9900');
    startMonitor();
    try {
      const result = await GAME_MANAGER.instance.PerformInanimateAction(id);
      console.log('%c[UNLOCK] PerformInanimateAction result:', 'color:#00ff88', result);
    } catch (e) {
      console.warn('[UNLOCK] PerformInanimateAction threw:', e);
      // Fallback: send raw Spell message
      sendRaw({ action: 'Spell', inanimateActionId: id });
    }
    await sleep(1000);
    const after = getState();
    console.log('[UNLOCK] inanimate after cast:', after.isInanimate, '| itemId:', after.itemId);
  }

  // ─────────────────────────────────────────────
  // FULL AUTO SEQUENCE
  // ─────────────────────────────────────────────

  async function run() {
    console.log('');
    console.log('%c╔══════════════════════════════════════════════╗', 'color:#00ccff;font-weight:bold');
    console.log('%c║  BMR_UnlockItem - Inanimate Turn-Back v2.0  ║', 'color:#00ccff;font-weight:bold');
    console.log('%c╚══════════════════════════════════════════════╝', 'color:#00ccff;font-weight:bold');
    console.log('');

    // Start monitoring so we see server responses in console
    startMonitor();

    const s = printStatus();

    if (!s.isInanimate && !s.itemId) {
      console.log('%c[UNLOCK] You don\'t appear to be inanimate. Nothing to do.', 'color:#00ff88');
      console.log('[UNLOCK] If the UI still shows inanimate state, run UNLOCK.clientReset()');
      stopMonitor();
      return;
    }

    // ── STEP 1: NPC Ward Nurse Unlock via raw WS ──
    console.log('\n%c[1/3] NPC ward nurse unlock (raw WS — bypasses inanimate guard)...', 'color:#aaaaff;font-weight:bold');
    await npcUnlock();
    await sleep(1000);

    // ── STEP 2: Form turnBack via raw WS ──
    console.log('\n%c[2/3] Form turnBack via raw WS...', 'color:#aaaaff;font-weight:bold');
    await formTurnBack();
    await sleep(1000);

    // ── STEP 3: Check result; nuclear client reset if still stuck ──
    console.log('\n%c[3/3] Checking result...', 'color:#aaaaff;font-weight:bold');
    const after = getState();
    if (!after.isInanimate && !after.itemId) {
      console.log('%c✓ SUCCESS! Server freed you!', 'color:#00ff88;font-size:14px;font-weight:bold');
      stopMonitor();
      return;
    }

    console.log('%c[UNLOCK] Server hasn\'t freed you yet. Running client reset for UI...', 'color:#ffaa00');
    await clientReset();
    await sleep(800);

    console.log('');
    console.log('');
    console.log('%c══════════════════════════════════════════════════════════', 'color:#ff4444;font-weight:bold');
    console.log('%c  WHY THIS KEEPS FAILING:', 'color:#ffffff;font-weight:bold');
    console.log('%c  The server blocks ALL Crafting actions while you are inanimate.', 'color:#ffffff');
    console.log('%c  This is a SERVER guard — no amount of raw WS tricks can bypass it.', 'color:#ffffff');
    console.log('');
    console.log('%c  THE REAL SOLUTION:', 'color:#ffff00;font-weight:bold');
    console.log('%c  You need a NON-INANIMATE player to do the NPC unlock FOR you.', 'color:#ffffff');
    console.log('%c  Run:  UNLOCK.helperCommand()  to get the exact command to share.', 'color:#00ff88;font-weight:bold');
    console.log('%c══════════════════════════════════════════════════════════', 'color:#ff4444;font-weight:bold');
    console.log('');
    console.log('[UNLOCK] Done. Run UNLOCK.status() to check current state.');
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────

  window.UNLOCK = {
    run,
    status: printStatus,
    monitor: startMonitor,
    stopMonitor,
    /** ★ Dev-authorized: open WS as owner and NPC-unlock. Pass whatever the dev gave you. */
    ownerUnlock,
    escape: tryEscape,
    helperCommand,
    claimScript,
    inspectActions,
    castInanimateAction,
    npcUnlock,
    turnBack: formTurnBack,
    clientReset,
    sendRaw,
  };

  // ─────────────────────────────────────────────
  // STARTUP
  // ─────────────────────────────────────────────

  console.log('');
  console.log('%c✅ BMR_UnlockItem v3 loaded!', 'color:#00ff88;font-weight:bold');
  console.log('');
  console.log('  %cUNLOCK.ownerUnlock(token)%c        ← ★ DEV-AUTHORIZED: use owner token/session', 'color:#00ff88', 'color:#ffffff');
  console.log('  %cUNLOCK.escape()%c                  ← escape from Max (owner 7d offline)', 'color:#ffff00', 'color:#ffffff');
  console.log('  %cUNLOCK.turnBack()%c                ← run after NPC unlock succeeds', 'color:#ffff00', 'color:#ffffff');
  console.log('  %cUNLOCK.helperCommand()%c           ← script for helper account', 'color:#aaaaaa', 'color:#ffffff');
  console.log('  %cUNLOCK.clientReset()%c             ← free UI client-side', 'color:#aaaaaa', 'color:#ffffff');
  console.log('');

})();
