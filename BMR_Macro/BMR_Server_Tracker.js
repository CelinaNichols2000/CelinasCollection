(function(){
  if (window.BMRWs && window.BMRWs.initialized) {
    console.log("BMRWs already initialized");
    return;
  }

  const nativeWebSocket = window.WebSocket;
  const nativeSend = WebSocket.prototype.send;

  function isActive(ws){ return ws && ws.readyState===1; }

  function tryWrap(ws){
    if (!ws || ws.__bmrws_wrapped) return;
    ws.__bmrws_wrapped = true;
    const originalSend = ws.send.bind(ws);
    ws.send = function(data){
      if (typeof data === "string") {
        // console.log("BMRWs outbound", data);
      }
      return originalSend(data);
    };
  }

  function findHiddenWebSocket(){
    if (!window.GAME_MANAGER) return null;
    const symbols = Object.getOwnPropertySymbols(window.GAME_MANAGER);
    for (const sym of symbols){
      try {
        const candidate = window.GAME_MANAGER[sym];
        if (isActive(candidate)) return candidate;
      } catch(e){ /* ignore */ }
    }
    const props = Object.getOwnPropertyNames(window.GAME_MANAGER);
    for (const prop of props){
      if (prop.toLowerCase().includes('ws') || prop.toLowerCase().includes('socket')){
        try {
          const candidate = window.GAME_MANAGER[prop];
          if (isActive(candidate)) return candidate;
        } catch(e){ /* ignore */ }
      }
    }
    return null;
  }

  window.BMRWs = {
    initialized: true,
    sockets: new Set(),

    installWebSocketHook() {
      if (window.WebSocket !== this.wrappedWebSocket) {
        this.wrappedWebSocket = function(url, protocols){
          const instance = protocols ? new nativeWebSocket(url, protocols) : new nativeWebSocket(url);
          window.BMRWs.watchSocket(instance);
          instance.addEventListener('open', () => {
            window.BMRWs.watchSocket(instance);
            console.log('BMRWs: socket open', url);
          });
          instance.addEventListener('close', () => {
            window.BMRWs.sockets.delete(instance);
            console.log('BMRWs: socket closed', url);
          });
          return instance;
        };
        this.wrappedWebSocket.prototype = nativeWebSocket.prototype;
        window.WebSocket = this.wrappedWebSocket;
      }
      // hook existing existing prototype send to capture non-proxy sockets too
      WebSocket.prototype.send = function(data) {
        try {
          if (isActive(this)) window.BMRWs.watchSocket(this);
        } catch(e){/*ignore*/}
        return nativeSend.call(this, data);
      };
    },

    watchSocket(ws){
      if (!ws || typeof ws.readyState !== 'number') return;
      if (isActive(ws)) this.sockets.add(ws);
      tryWrap(ws);
      ws.addEventListener('close', () => this.sockets.delete(ws));
      ws.addEventListener('error', () => this.sockets.delete(ws));
    },

    scanLookupCandidates(){
      const names = [
        "window.ws", "window.socket", "window.GAME_MANAGER.ws",
        "window.GAME_MANAGER.socket", "window.gameSocket", "window._ws",
        "window.__ws", "window.game.ws", "window.game.socket",
      ];
      const hits = [];
      for (const n of names){
        try {
          const val = eval(n);
          if (isActive(val)) hits.push(val);
        } catch(e){}
      }
      // also check all window props in case of randomized names
      for (const key of Object.keys(window)) {
        if (!key.toLowerCase().includes("ws") && !key.toLowerCase().includes("socket")) continue;
        const candidate = window[key];
        if (isActive(candidate) && !hits.includes(candidate)){
          hits.push(candidate);
        }
      }
      return hits;
    },

    findWs(){
      const gmws = window.GAME_MANAGER && (window.GAME_MANAGER.ws || window.GAME_MANAGER.socket);
      if (isActive(gmws)) return gmws;

      const hiddenWs = findHiddenWebSocket();
      if (isActive(hiddenWs)) return hiddenWs;

      if (Array.isArray(window._wsCapture)) {
        const fromCapture = window._wsCapture.find(isActive);
        if (fromCapture) return fromCapture;
      }

      const scanHits = this.scanLookupCandidates();
      if (scanHits.length) return scanHits[0];

      for (const s of this.sockets) {
        if (isActive(s)) return s;
      }

      const all = (window.__ws || []);
      const found = Array.from(all).find(isActive);
      if (found) return found;

      const candidates = Array.from(document.querySelectorAll('*')).map(el => el.__ws).filter(Boolean);
      for (const c of candidates) {
        if (isActive(c)) return c;
      }

      return null;
    },

    forceWs(ws){
      if (!isActive(ws)) throw new Error('Invalid WebSocket');
      this.manuallySetWs = ws;
      this.watchSocket(ws);
      console.log('BMRWs: forced WS set', ws.url || '(unknown)');
      return ws;
    },

    send(payload){
      const ws = this.manuallySetWs || this.findWs();
      if (!ws) throw new Error('WS not found');
      const text = JSON.stringify(payload);
      ws.send(text);
      console.log('BMRWs SENT', text);
    },

    async wait(ms){ return new Promise(r=>setTimeout(r,ms)); },

    async transformTarget(targetToken, spellId=21){
      console.log('BMRWs transformTarget', targetToken, spellId);
      this.send({ menu: { refresh: 'inspect', token: targetToken }});
      await this.wait(250);
      this.send({ spellId, selfcast: false, variant: null, materialsRequired: false, action: 'Spell', id: Date.now()%100000 });
      await this.wait(220);
      this.send({ action: 'Scenario' });
      await this.wait(70);
      this.send({ action: 'Scenario', callbackId: 1 });
      await this.wait(70);
      this.send({ action: 'Scenario', callbackId: 2, response: false });
      await this.wait(70);
      this.send({ action: 'Scenario', callbackId: 3, response: false });
      await this.wait(900);
      this.send({ menu: { refresh: 'yourself' }});
      await this.wait(250);
      console.log('BMRWs transformTarget sequence dispatched', targetToken);
    }
  };

  window.BMRWs.installWebSocketHook();
  window.BMRWs.watchSocket(window.GAME_MANAGER && window.GAME_MANAGER.ws);
  window.BMRWs.watchSocket(window.GAME_MANAGER && window.GAME_MANAGER.socket);
  if (Array.isArray(window._wsCapture)) window._wsCapture.forEach(socket => window.BMRWs.watchSocket(socket));

  console.log('BMRWs initialized, call BMRWs.findWs(), BMRWs.send({..}), BMRWs.transformTarget(token)');
})();