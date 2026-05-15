// ====================================================================
// BMR Item Fitting Box
// Opens an overlay showing all game items, their color variants,
// image URLs and IDs — with copy buttons.
// Run again to toggle open/closed.
// ====================================================================

(() => {
  if (window.__BMR_FITTING_BOX) { window.__BMR_FITTING_BOX.toggle(); return; }

  const gm = GAME_MANAGER.instance;

  const COLOR_MAP = {
    'Black':'#1a1a1a','White':'#f0f0f0','Red':'#E74C3C','Pink':'#FF69B4',
    'Blue':'#3498DB','Green':'#2ECC71','Yellow':'#F1C40F','Orange':'#E67E22',
    'Brown':'#8B4513','Gray':'#95A5A6','Purple':'#9B59B6','Teal':'#1ABC9C',
    'Cyan':'#00CED1','Magenta':'#FF00FF','Lime':'#32CD32','Navy':'#000080',
    'Maroon':'#800000','Olive':'#808000','Gold':'#FFD700','Silver':'#C0C0C0',
    'Beige':'#F5F5DC','Tan':'#D2B48C'
  };

  // ─── ITEM DISCOVERY ──────────────────────────────────────────────────
  // Pull base items from all instance items the player currently has.
  // gm.GetItemIds() returns every instance ID in _items.
  // gm.GetItem(instanceId) merges the instance with its base template.
  function discoverItemsFromInventory() {
    const found = new Map(); // base id -> base item object

    // All inventory instance items
    try {
      const ids = gm.GetItemIds() || [];
      ids.forEach(id => {
        try {
          const it = gm.GetItem(id);
          if (it?.base?.image_url && it.base.id != null) found.set(it.base.id, it.base);
        } catch(e) {}
      });
    } catch(e) {}

    // Equipped items (may overlap, but covers edge cases)
    try {
      const eq = gm.equipment?.items || [];
      eq.forEach(id => {
        if (!id) return;
        try {
          const it = gm.GetItem(id);
          if (it?.base?.image_url && it.base.id != null) found.set(it.base.id, it.base);
        } catch(e) {}
      });
    } catch(e) {}

    // Current inanimate item (if character is inanimate)
    try {
      const charItem = gm.character?.item;
      if (charItem?.id) {
        const it = gm.GetItem(charItem.id);
        if (it?.base?.image_url && it.base.id != null) found.set(it.base.id, it.base);
      }
    } catch(e) {}

    return Array.from(found.values());
  }

  // Grab one item (any representation) and add its base to found map
  function grabItemIntoMap(found, item) {
    if (!item) return;
    try {
      // Already a full item object with resolved base
      if (typeof item === 'object' && item.base && typeof item.base === 'object' && item.base.image_url) {
        const b = item.base;
        if (b.id != null) found.set(b.id, b);
        return;
      }
      // Item object with base as integer — look up template
      if (typeof item === 'object') {
        const baseId = typeof item.base === 'number' ? item.base
                     : typeof item.base_id === 'number' ? item.base_id
                     : typeof item.baseId === 'number' ? item.baseId : null;
        if (baseId != null) {
          try { const b = gm.GetBaseItem(baseId); if (b?.image_url && b.id != null) found.set(b.id, b); } catch(e) {}
          return;
        }
        // Item object might itself be a base item (no 'base' field)
        if (item.image_url && item.id != null) { found.set(item.id, item); return; }
      }
      // Raw instance or base ID as number
      if (typeof item === 'number') {
        try { const it = gm.GetItem(item); if (it?.base?.image_url && it.base.id != null) { found.set(it.base.id, it.base); return; } } catch(e) {}
        try { const b = gm.GetBaseItem(item); if (b?.image_url && b.id != null) found.set(b.id, b); } catch(e) {}
      }
    } catch(e) {}
  }

  // Walk a character object and extract everything that looks like an item
  function extractCharItems(found, char) {
    if (!char) return;
    const eq = char.equipment;
    if (eq) {
      if (Array.isArray(eq)) {
        // Flat array of items or IDs
        eq.forEach(it => grabItemIntoMap(found, it));
      } else if (typeof eq === 'object') {
        // {items: [...], worn: [...]} — the standard game format for YOUR equipment
        // For opponents the server may send items as an array of full item objects
        if (Array.isArray(eq.items)) eq.items.forEach(it => grabItemIntoMap(found, it));
        if (Array.isArray(eq.worn))  eq.worn.forEach(it => grabItemIntoMap(found, it));
      }
    }
    // Also grab the inanimate item the character is trapped in (if any)
    if (char.item) grabItemIntoMap(found, char.item);
  }

  // Harvest base items from all characters currently visible at your location.
  // The game sends opponents' full character data including all their worn items,
  // so we can extract their base item templates from their character objects.
  function discoverItemsFromLocation() {
    const found = new Map();
    const chars = new Set();
    try { const v = LOCATION.instance?.opponent; if (v) chars.add(v); } catch(e) {}
    try { const v = LOCATION.instance?.player;   if (v) chars.add(v); } catch(e) {}
    try { const v = gm.owner;                    if (v) chars.add(v); } catch(e) {}
    try {
      const ps = LOCATION.instance?.players;
      if (Array.isArray(ps)) ps.forEach(p => p && chars.add(p));
    } catch(e) {}
    try { (gm.recentCharacters || []).forEach(c => c && chars.add(c)); } catch(e) {}
    chars.forEach(char => extractCharItems(found, char));
    return Array.from(found.values());
  }

  // Supplement: scan base IDs 1-3000 via GetBaseItem (slow, finds items
  // the server has sent that aren't necessarily in your current inventory).
  function scanItemsByID(onFound, onDone) {
    const seen = new Set(allItems.map(i => i.id));
    const extra = [];
    let id = 1;
    const max = 3000;
    function next() {
      if (id > max) { onDone(extra); return; }
      try {
        const item = gm.GetBaseItem(id);
        if (item?.image_url && !seen.has(item.id)) {
          seen.add(item.id);
          extra.push(item);
          onFound(item, extra.length);
        }
      } catch(e) {}
      id++;
      if (id % 10 === 0) setTimeout(next, 0); else next();
    }
    next();
  }

  // ─── INSTANCE / BASE ID LOOKUP ───────────────────────────────────────
  // Accepts large instance IDs (e.g. 7727094) or small base IDs (e.g. 137).
  function lookupItemById(rawId) {
    const numId = parseInt(rawId);
    if (!numId) return;
    let baseItem = null;
    let instanceId = null;
    let variantColor = null;
    let fullItem = null;

    // First try as instance ID (e.g. from gm.equipment.items array)
    try {
      const it = gm.GetItem(numId);
      if (it?.base?.image_url) {
        baseItem = it.base;
        instanceId = numId;
        variantColor = it.variant_color || null;
        fullItem = it;
      }
    } catch(e) {}

    // Fallback: try as base template ID
    if (!baseItem) {
      try {
        const base = gm.GetBaseItem(numId);
        if (base?.image_url) baseItem = base;
      } catch(e) {}
    }

    if (baseItem) {
      renderDetail(baseItem, { instanceId, variantColor, fullItem });
      statusEl.textContent = 'Lookup: ' + numId;
    } else if (numId < 10000) {
      // Looks like a base ID — scan nearby base IDs
      scanNearestBaseId(numId);
    } else {
      // Large instance ID not in inventory — scan nearby instance IDs
      scanNearestInstanceId(numId);
    }
  }

  // Scan instance IDs up and down from startId using gm.GetItem() (large IDs)
  function scanNearestInstanceId(startId) {
    detailEl.innerHTML = `<div style="padding:20px;font-size:12px;color:#888">ID ${startId} not in inventory — scanning nearby instance IDs…<br><small id="bmr-scan-msg" style="color:#555"></small></div>`;
    let up   = startId + 1;
    let down = startId - 1;
    let steps = 0;
    const maxSteps = 2000;
    function tick() {
      if (steps++ > maxSteps) {
        detailEl.innerHTML = `<div style="color:#e94560;padding:20px;font-size:13px;">No item found near ID ${startId}.<br>
          <small style="color:#666">Those instance IDs only exist on the server — only items sent to your client (inventory, location, equipment) are accessible.</small></div>`;
        return;
      }
      try {
        const it = gm.GetItem(up);
        if (it?.base?.image_url) {
          renderDetail(it.base, { instanceId: up, variantColor: it.variant_color, fullItem: it });
          statusEl.textContent = 'Nearest ↑#' + up + ' (from ' + startId + ')';
          return;
        }
      } catch(e) {}
      up++;
      if (down > 0) {
        try {
          const it = gm.GetItem(down);
          if (it?.base?.image_url) {
            renderDetail(it.base, { instanceId: down, variantColor: it.variant_color, fullItem: it });
            statusEl.textContent = 'Nearest ↓#' + down + ' (from ' + startId + ')';
            return;
          }
        } catch(e) {}
        down--;
      }
      const msg = document.getElementById('bmr-scan-msg');
      if (msg) msg.textContent = `Tried ${steps} IDs (↑${up} ↓${down})`;
      if (steps % 50 === 0) setTimeout(tick, 0); else tick();
    }
    tick();
  }

  // Scan base IDs up (and down) from startId until finding the next loaded one.
  function scanNearestBaseId(startId) {
    detailEl.innerHTML = `<div style="padding:20px;font-size:12px;color:#888">ID ${startId} not in cache — scanning nearby IDs…</div>`;
    let up   = startId;
    let down = startId - 1;
    let steps = 0;
    const maxSteps = 400;
    function tick() {
      if (steps++ > maxSteps) {
        detailEl.innerHTML = `<div style="color:#e94560;padding:20px;font-size:13px;">No item found near ID ${startId} in the game’s loaded data.<br>
          <small style="color:#666">Use <b>Scan Location Players</b> or <b>Deep Scan</b> to load more items first.</small></div>`;
        return;
      }
      try {
        const item = gm.GetBaseItem(up);
        if (item?.image_url) {
          renderDetail(item);
          statusEl.textContent = 'Nearest ↑#' + up + ' (from ' + startId + ')';
          return;
        }
      } catch(e) {}
      up++;
      if (down > 0) {
        try {
          const item = gm.GetBaseItem(down);
          if (item?.image_url) {
            renderDetail(item);
            statusEl.textContent = 'Nearest ↓#' + down + ' (from ' + startId + ')';
            return;
          }
        } catch(e) {}
        down--;
      }
      setTimeout(tick, 0);
    }
    tick();
  }

  function getColoredURL(item, colorName) {
    if (!item?.image_url) return '';
    try {
      if (typeof formatMediaURL === 'function') {
        const ref = typeof nameToRef === 'function' ? nameToRef(colorName) : colorName;
        const url = formatMediaURL(item.image_url, 256, ref);
        if (url) return url;
      }
    } catch(e) {}
    return item.image_url;
  }

  function getItemColors(item) {
    if (!item.color_variants?.length) return [null];
    if (item.color_variants[0] === '*') return Object.keys(COLOR_MAP);
    return item.color_variants;
  }

  // ─── STYLES ──────────────────────────────────────────────────────────

  const style = document.createElement('style');
  style.id = 'bmr-fitbox-style';
  style.textContent = `
    #bmr-fitbox {
      position:fixed; top:5vh; left:50%; transform:translateX(-50%);
      width:940px; max-width:97vw; height:88vh;
      background:#12121f; border:2px solid #e94560; border-radius:12px;
      z-index:999999; display:flex; flex-direction:column;
      font-family:'Segoe UI',sans-serif; color:#eee;
      box-shadow:0 12px 60px #000c;
    }
    #bmr-fitbox-header {
      display:flex; align-items:center; gap:10px; padding:10px 14px;
      background:#1a1a30; border-radius:10px 10px 0 0;
      border-bottom:1px solid #e94560; flex-shrink:0;
    }
    #bmr-fitbox-header h2 { margin:0; font-size:15px; color:#e94560; flex-shrink:0; }
    #bmr-fitbox-search {
      flex:1; min-width:80px; padding:5px 10px; border-radius:6px;
      border:1px solid #e94560; background:#0c1a30; color:#eee; font-size:12px;
    }
    #bmr-lookup-wrap { display:flex; gap:4px; align-items:center; flex-shrink:0; }
    #bmr-lookup-input {
      width:110px; padding:5px 8px; border-radius:6px;
      border:1px solid #555; background:#0c1a30; color:#eee; font-size:12px;
    }
    #bmr-lookup-input:focus { border-color:#e94560; outline:none; }
    #bmr-lookup-btn {
      background:#1a1a30; border:1px solid #e94560; color:#e94560;
      padding:4px 10px; border-radius:6px; font-size:11px; cursor:pointer; white-space:nowrap;
    }
    #bmr-lookup-btn:hover { background:#e94560; color:#fff; }
    #bmr-fitbox-status { font-size:11px; color:#777; white-space:nowrap; min-width:80px; text-align:right; }
    #bmr-fitbox-close {
      background:none; border:none; color:#e94560;
      font-size:18px; cursor:pointer; line-height:1;
    }
    #bmr-fitbox-body { display:flex; flex:1; overflow:hidden; }
    #bmr-fitbox-list {
      width:250px; flex-shrink:0; overflow-y:auto;
      padding:6px; border-right:1px solid #2a2a40; background:#0e0e1e;
    }
    #bmr-fitbox-list::-webkit-scrollbar { width:4px; }
    #bmr-fitbox-list::-webkit-scrollbar-thumb { background:#e94560; border-radius:4px; }
    .bmr-item-row {
      display:flex; align-items:center; gap:7px; padding:5px 7px;
      border-radius:6px; cursor:pointer; border:1px solid transparent;
      margin-bottom:2px;
    }
    .bmr-item-row:hover  { background:#0f2040; border-color:#e94560; }
    .bmr-item-row.active { background:#0f2040; border-color:#e94560; }
    .bmr-item-thumb {
      width:34px; height:34px; object-fit:contain;
      border-radius:4px; background:#090916; flex-shrink:0;
    }
    .bmr-item-name { font-size:11px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .bmr-item-id   { font-size:10px; color:#666; }
    #bmr-fitbox-detail { flex:1; padding:14px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; }
    #bmr-fitbox-detail::-webkit-scrollbar { width:4px; }
    #bmr-fitbox-detail::-webkit-scrollbar-thumb { background:#333; border-radius:4px; }
    #bmr-detail-top { display:flex; gap:14px; align-items:flex-start; }
    #bmr-detail-img {
      width:200px; height:200px; object-fit:contain;
      border-radius:8px; background:#090916; border:1px solid #2a2a40; flex-shrink:0;
    }
    #bmr-detail-meta { flex:1; display:flex; flex-direction:column; gap:7px; min-width:0; }
    #bmr-detail-meta h3 { margin:0; font-size:17px; color:#e94560; }
    .bmr-row { font-size:12px; display:flex; align-items:baseline; gap:4px; flex-wrap:wrap; }
    .bmr-label { color:#777; }
    .bmr-url-box {
      background:#090916; border:1px solid #2a2a40; border-radius:5px;
      padding:5px 8px; font-size:10px; color:#aaa; word-break:break-all;
      font-family:monospace; display:flex; align-items:flex-start; gap:6px;
    }
    .bmr-url-text { flex:1; }
    .bmr-copy {
      flex-shrink:0; background:#0f2040; border:1px solid #e94560;
      color:#eee; border-radius:4px; padding:1px 7px; font-size:10px;
      cursor:pointer; white-space:nowrap;
    }
    .bmr-copy:hover { background:#e94560; }
    #bmr-colors-section h4 { margin:0 0 7px 0; font-size:12px; color:#ccc; }
    #bmr-colors-grid { display:flex; flex-wrap:wrap; gap:5px; }
    .bmr-swatch {
      width:24px; height:24px; border-radius:50%;
      border:2px solid transparent; cursor:pointer;
      transition:transform .1s, border-color .1s;
    }
    .bmr-swatch:hover  { border-color:#fff; transform:scale(1.25); }
    .bmr-swatch.active { border-color:#e94560; transform:scale(1.2); }
    #bmr-no-items { padding:16px; color:#555; font-size:12px; }
    #bmr-scan-area { padding:10px; }
    .bmr-scan-btn {
      background:#e94560; border:none; color:#fff;
      padding:7px 14px; border-radius:6px; cursor:pointer; font-size:12px;
    }
    .bmr-scan-btn:hover { background:#c73652; }
    .bmr-progress { font-size:11px; color:#888; margin-top:6px; }
    .bmr-tag {
      display:inline-block; background:#1a1a30; border:1px solid #333;
      border-radius:3px; padding:1px 5px; font-size:10px; color:#aaa;
    }
    /* Enchantment hover tags */
    .bmr-enchant-tag {
      position:relative; display:inline-block;
      background:#0c0c24; border:1px solid #6a3f80;
      border-radius:3px; padding:2px 8px; font-size:10px;
      color:#c080ff; cursor:default; margin:2px;
    }
    .bmr-enchant-tag::after {
      content:attr(data-tip); display:none;
      position:absolute; bottom:calc(100% + 5px); left:50%;
      transform:translateX(-50%);
      background:#0c0c1c; border:1px solid #6a3f80;
      border-radius:4px; padding:5px 9px; font-size:11px;
      color:#eee; white-space:pre; z-index:20000;
      pointer-events:none; max-width:260px;
      text-align:left; white-space:normal;
    }
    .bmr-enchant-tag:hover::after { display:block; }
    /* Inanimate card */
    .bmr-inanimate-card {
      background:#0c0c1e; border:1px solid #6a3f80;
      border-radius:6px; padding:10px 12px;
      display:flex; flex-direction:column; gap:6px;
    }
    .bmr-inanimate-card h4 { margin:0 0 4px; color:#c080ff; font-size:12px; }
    .bmr-inspect-btn {
      background:#1a1a30; border:1px solid #6a3f80; color:#c080ff;
      padding:4px 12px; border-radius:5px; font-size:11px;
      cursor:pointer; align-self:flex-start;
    }
    .bmr-inspect-btn:hover { background:#6a3f80; color:#fff; }
    /* Section block (enchants, inanimate) */
    .bmr-section-block { display:flex; flex-direction:column; gap:5px; }
    .bmr-section-block h4 { margin:0 0 4px; }
    /* Inanimate scan button */
    .bmr-inanim-btn {
      background:#160d28; border:1px solid #c080ff; color:#c080ff;
      padding:5px 12px; border-radius:6px; cursor:pointer; font-size:11px;
      margin-top:5px; display:block; width:100%; box-sizing:border-box;
    }
    .bmr-inanim-btn:hover { background:#c080ff; color:#fff; }
    /* Inanimate list row highlight */
    .bmr-item-row.inanimate { border-color:#6a3f80 !important; }
    .bmr-item-row.inanimate .bmr-item-name { color:#c080ff; }
    .bmr-inanim-charname { font-size:10px; color:#9a60cf; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      padding:5px 12px; border-radius:6px; cursor:pointer; font-size:11px;
      margin-top:5px; display:block; width:100%; box-sizing:border-box;
    }
    .bmr-api-btn:hover { background:#4080e0; color:#fff; }
    /* Auto-capture status box */
    #bmr-brute-area {
      padding:8px 10px; background:#0a0a18;
      border-top:1px solid #1a1a30; margin-top:4px;
    }
    #bmr-brute-area label { font-size:10px; color:#888; display:block; margin-bottom:3px; }
    .bmr-brute-btn {
      background:#2a0a0a; border:1px solid #e94560; color:#e94560;
      padding:5px 10px; border-radius:6px; cursor:pointer; font-size:11px;
      width:100%; margin-top:3px; box-sizing:border-box;
    }
    .bmr-brute-btn:hover { background:#e94560; color:#fff; }
    #bmr-brute-status { font-size:10px; color:#888; margin-top:3px; line-height:1.4; }
    .bmr-profile-link {
      display:inline-block; background:#1a1a30; border:1px solid #6a3f80;
      color:#c080ff; border-radius:5px; padding:4px 12px; font-size:11px;
      text-decoration:none; align-self:flex-start;
    }
    .bmr-profile-link:hover { background:#6a3f80; color:#fff; }
    /* Token lookup */
    #bmr-token-wrap { display:flex; gap:4px; margin-top:8px; }
    #bmr-token-input {
      flex:1; min-width:0; padding:5px 8px; border-radius:6px;
      border:1px solid #555; background:#0c1a30; color:#eee; font-size:11px;
    }
    #bmr-token-input:focus { border-color:#e94560; outline:none; }
    #bmr-token-input::placeholder { color:#444; }
    #bmr-token-btn {
      background:#1a1a30; border:1px solid #e94560; color:#e94560;
      padding:4px 8px; border-radius:6px; font-size:11px; cursor:pointer; white-space:nowrap;
    }
    #bmr-token-btn:hover { background:#e94560; color:#fff; }
    #bmr-token-hint { font-size:10px; color:#444; margin-top:3px; }
  `;
  document.head.appendChild(style);

  // ─── MARKUP ──────────────────────────────────────────────────────────

  const panel = document.createElement('div');
  panel.id = 'bmr-fitbox';
  panel.innerHTML = `
    <div id="bmr-fitbox-header">
      <h2>⬡ Item Fitting Box</h2>
      <input id="bmr-fitbox-search" placeholder="Search by name or ID…" type="text">
      <div id="bmr-lookup-wrap">
        <input id="bmr-lookup-input" placeholder="Instance/Base ID…" type="number">
        <button id="bmr-lookup-btn">Lookup</button>
      </div>
      <span id="bmr-fitbox-status">—</span>
      <button id="bmr-fitbox-close" title="Close">✕</button>
    </div>
    <div id="bmr-fitbox-body">
      <div id="bmr-fitbox-list">
        <div id="bmr-scan-area">
          <button class="bmr-scan-btn" id="bmr-scan-btn">Deep Scan (1–3000)</button>
          <button class="bmr-api-btn" id="bmr-loc-btn">Scan Location Players</button>
          <button class="bmr-inanim-btn" id="bmr-inanim-btn">🧸 Find Inanimate Players</button>
          <div class="bmr-progress" id="bmr-progress"></div>
          <div id="bmr-token-wrap">
            <input id="bmr-token-input" placeholder="Paste character token…" type="text">
            <button id="bmr-token-btn">Load Items</button>
          </div>
          <div id="bmr-token-hint">Token → load all their items</div>
        </div>
        <div id="bmr-brute-area">
          <label>🟣 Live auto-capture active — inanimate players are collected as you visit locations.</label>
          <button class="bmr-brute-btn" id="bmr-brute-btn">🧸 Snapshot Current Location</button>
          <div id="bmr-brute-status">Walk around the game and inanimate players will appear here automatically.</div>
        </div>
      </div>
      <div id="bmr-fitbox-detail">
        <div style="color:#444;font-size:13px;padding:20px;">Select an item from the list.</div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  const listEl      = document.getElementById('bmr-fitbox-list');
  const detailEl    = document.getElementById('bmr-fitbox-detail');
  const searchEl    = document.getElementById('bmr-fitbox-search');
  const statusEl    = document.getElementById('bmr-fitbox-status');
  const progressEl  = document.getElementById('bmr-progress');
  const lookupInput = document.getElementById('bmr-lookup-input');
  const lookupBtn   = document.getElementById('bmr-lookup-btn');

  let allItems  = [];
  let activeRow = null;

  // Stored inanimate instance results: array of { baseItem, instanceId, variantColor, fullItem }
  let inanimateResults = [];

  // Sweep every item in the client’s loaded cache + all visible characters
  // and collect items that contain a trapped player (item.character with id_token).
  // This reads local memory only — no server calls — but covers:
  //   • Your own inventory (_items via GetItemIds)
  //   • Every character you’ve encountered this session (LOCATION, recentCharacters)
  //   • SCENE rendered characters
  function findInanimateItems() {
    const seen = new Set(); // instance IDs already checked
    const results = [];

    function tryInstance(id) {
      if (!id || seen.has(id)) return;
      seen.add(id);
      try {
        const it = gm.GetItem(id);
        if (it?.character?.id_token && it?.base?.image_url) {
          results.push({ baseItem: it.base, instanceId: id, variantColor: it.variant_color || null, fullItem: it });
        }
      } catch(e) {}
    }

    // 1. All items in your own _items cache
    try { (gm.GetItemIds() || []).forEach(tryInstance); } catch(e) {}

    // 2. Equipment slots
    try { (gm.equipment?.items || []).forEach(tryInstance); } catch(e) {}

    // 3. Current inanimate item on self
    try { if (gm.character?.item?.id) tryInstance(gm.character.item.id); } catch(e) {}

    // 4. All visible location characters
    const chars = new Set();
    try { const v = LOCATION.instance?.opponent; if (v) chars.add(v); } catch(e) {}
    try { const v = LOCATION.instance?.player;   if (v) chars.add(v); } catch(e) {}
    try { const v = gm.owner;                    if (v) chars.add(v); } catch(e) {}
    try { const ps = LOCATION.instance?.players; if (Array.isArray(ps)) ps.forEach(p => p && chars.add(p)); } catch(e) {}
    try { (gm.recentCharacters || []).forEach(c => c && chars.add(c)); } catch(e) {}
    // Also check SCENE displayed characters
    try { for (let pos = 0; pos < 4; pos++) { const c = SCENE.instance?.GetDisplayedCharacter(pos); if (c) chars.add(c); } } catch(e) {}

    chars.forEach(char => {
      // Check if the character themselves is inanimate (they ARE an item)
      try {
        const ci = char.item;
        if (ci?.id && ci?.character?.id_token && ci?.base?.image_url) {
          if (!seen.has(ci.id)) {
            seen.add(ci.id);
            results.push({ baseItem: ci.base, instanceId: ci.id, variantColor: ci.variant_color || null, fullItem: ci });
          }
        }
      } catch(e) {}
      // Check their worn equipment
      const eq = char.equipment;
      const itemArr = Array.isArray(eq) ? eq
                    : Array.isArray(eq?.items) ? eq.items
                    : [];
      itemArr.forEach(item => {
        if (!item) return;
        try {
          // Fully resolved item object
          if (typeof item === 'object' && item.character?.id_token && item.base?.image_url) {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              results.push({ baseItem: item.base, instanceId: item.id, variantColor: item.variant_color || null, fullItem: item });
            }
            return;
          }
          // Raw instance ID — try GetItem
          const id = typeof item === 'number' ? item : (typeof item?.id === 'number' ? item.id : null);
          if (id) tryInstance(id);
        } catch(e) {}
      });
    });

    return results;
  }

  // Render inanimate-only list
  function renderInanimateList(items) {
    const scanArea = document.getElementById('bmr-scan-area');
    listEl.innerHTML = '';
    if (scanArea) listEl.appendChild(scanArea);
    if (!items.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:12px;font-size:11px;color:#666';
      empty.textContent = 'No inanimate players found in loaded data.';
      listEl.appendChild(empty);
      return;
    }
    items.forEach(({ baseItem, instanceId, variantColor, fullItem }) => {
      const ch = fullItem?.character;
      const charName = ch?.name || ch?.names || ch?.username || '?';
      const row = document.createElement('div');
      row.className = 'bmr-item-row inanimate';
      row.innerHTML = `
        <img class="bmr-item-thumb" src="${baseItem.image_url || ''}" onerror="this.style.opacity='.15'">
        <div style="min-width:0">
          <div class="bmr-item-name" title="${baseItem.item_name || ''}">${baseItem.item_name || '(item)'}</div>
          <div class="bmr-inanim-charname">🧸 ${charName}</div>
          <div class="bmr-item-id">Instance #${instanceId}</div>
        </div>
      `;
      row.addEventListener('click', () => {
        if (activeRow) activeRow.classList.remove('active');
        activeRow = row;
        row.classList.add('active');
        renderDetail(baseItem, { instanceId, variantColor, fullItem });
      });
      listEl.appendChild(row);
    });
  }

  // ─── LIST ────────────────────────────────────────────────────────────

  function renderList(items) {
    // keep scan area
    const scanArea = document.getElementById('bmr-scan-area');
    listEl.innerHTML = '';
    if (scanArea) listEl.appendChild(scanArea);

    if (!items.length) {
      const empty = document.createElement('div');
      empty.id = 'bmr-no-items';
      empty.textContent = 'No items found.';
      listEl.appendChild(empty);
      return;
    }
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'bmr-item-row';
      row.innerHTML = `
        <img class="bmr-item-thumb" src="${item.image_url || ''}" onerror="this.style.opacity='.15'">
        <div style="min-width:0">
          <div class="bmr-item-name" title="${item.item_name || ''}">${item.item_name || '(unnamed)'}</div>
          <div class="bmr-item-id">ID ${item.id}</div>
        </div>
      `;
      row.addEventListener('click', () => {
        if (activeRow) activeRow.classList.remove('active');
        activeRow = row;
        row.classList.add('active');
        renderDetail(item);
      });
      listEl.appendChild(row);
    });
  }

  searchEl.addEventListener('input', () => {
    const q = searchEl.value.toLowerCase();
    renderList(allItems.filter(i =>
      (i.item_name || '').toLowerCase().includes(q) || String(i.id).includes(q)
    ));
  });

  // ─── DETAIL ──────────────────────────────────────────────────────────
  // instanceInfo = { instanceId, variantColor } — optional, from ID lookup

  function urlBox(url) {
    return `<div class="bmr-url-box"><span class="bmr-url-text">${url}</span><button class="bmr-copy" data-copy="${url}">Copy</button></div>`;
  }

  function renderDetail(item, instanceInfo) {
    const colors  = getItemColors(item);
    let curColor  = (instanceInfo?.variantColor) || colors[0] || null;
    const initURL = curColor ? getColoredURL(item, curColor) : (item.image_url || '');

    const colorSwatches = () => colors.map(c => {
      const hex = c ? (COLOR_MAP[c] || '#555') : '#555';
      const active = c === curColor ? 'active' : '';
      return `<div class="bmr-swatch ${active}" data-color="${c || ''}" style="background:${hex}" title="${c || 'default'}"></div>`;
    }).join('');

    const slots = (item.slots || []).join(', ') || '—';
    const tags  = (item.types || item.tags || []).map(t => `<span class="bmr-tag">${t}</span>`).join(' ');

    const instanceRow = instanceInfo?.instanceId
      ? `<div class="bmr-row">
           <span class="bmr-label">Instance ID:</span>
           <b>${instanceInfo.instanceId}</b>
           <button class="bmr-copy" data-copy="${instanceInfo.instanceId}">Copy</button>
         </div>`
      : '';

    detailEl.innerHTML = `
      <div id="bmr-detail-top">
        <img id="bmr-detail-img" src="${initURL}" onerror="this.style.opacity='.2'">
        <div id="bmr-detail-meta">
          <h3>${item.item_name || 'Item #' + item.id}</h3>
          <div class="bmr-row">
            <span class="bmr-label">Base ID:</span>
            <b>${item.id}</b>
            <button class="bmr-copy" data-copy="${item.id}">Copy</button>
          </div>
          ${instanceRow}
          <div class="bmr-row"><span class="bmr-label">Type:</span> ${item.type || '—'} &nbsp; <span class="bmr-label">Group:</span> ${item.group ?? '—'}</div>
          <div class="bmr-row"><span class="bmr-label">Slots:</span> ${slots}</div>
          <div class="bmr-row"><span class="bmr-label">NSFW:</span> ${item.nsfw ? '🔞 Yes' : 'No'} &nbsp; <span class="bmr-label">Stack:</span> ${item.stack ?? '—'}</div>
          ${tags ? `<div class="bmr-row">${tags}</div>` : ''}
          <div class="bmr-row" style="margin-top:4px"><span class="bmr-label">Base image URL:</span></div>
          ${urlBox(item.image_url || '—')}
          ${item.worn_image_url ? `<div class="bmr-row"><span class="bmr-label">Worn URL:</span></div>${urlBox(item.worn_image_url)}` : ''}
        </div>
      </div>

      <div id="bmr-colors-section">
        <h4>Colors (${colors.length}) — <span id="bmr-cur-color">${curColor || 'default'}</span></h4>
        <div id="bmr-colors-grid">${colorSwatches()}</div>
        <div style="margin-top:8px">
          <div class="bmr-row"><span class="bmr-label">Colored URL:</span></div>
          <div id="bmr-colored-url">${urlBox(initURL)}</div>
        </div>
      </div>
      ${instanceInfo?.fullItem ? renderEnchantments(instanceInfo.fullItem.enchantments) : ''}
      ${instanceInfo?.fullItem ? renderInanimateCard(instanceInfo.fullItem) : ''}
    `;

    // Swatch interaction
    detailEl.querySelectorAll('.bmr-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        curColor = sw.dataset.color || null;
        const url = curColor ? getColoredURL(item, curColor) : (item.image_url || '');
        document.getElementById('bmr-detail-img').src = url;
        document.getElementById('bmr-cur-color').textContent = curColor || 'default';
        document.getElementById('bmr-colored-url').innerHTML = urlBox(url);
        detailEl.querySelectorAll('.bmr-swatch').forEach(s => s.classList.toggle('active', s === sw));
        bindCopy();
      });
    });

    bindCopy();
  }

  // ─── ENCHANTMENTS / INANIMATE HELPERS ───────────────────────────────

  function renderEnchantments(enchantments) {
    if (!enchantments?.length) return '';
    const tags = enchantments.map(enc => {
      let name, level = '', tip;
      if (typeof enc === 'object' && enc !== null) {
        name = enc.enchantment_name || enc.name || enc.item_name || ('Ench #' + (enc.id ?? '?'));
        if (enc.level != null) level = ' Lv' + enc.level;
        tip = enc.description ? (name + level + '\n' + enc.description) : (name + level);
        if (enc.bonus != null) tip += '\n+' + enc.bonus;
      } else {
        name = 'Enchantment #' + enc;
        tip = 'ID: ' + enc;
      }
      return `<span class="bmr-enchant-tag" data-tip="${tip.replace(/"/g, '&quot;').replace(/\n/g, '&#10;')}">${name}${level}</span>`;
    }).join('');
    return `<div class="bmr-section-block">
      <h4 style="font-size:12px;color:#c080ff;">✦ Enchantments (${enchantments.length}) <small style="color:#555;font-weight:normal">hover for details</small></h4>
      <div style="display:flex;flex-wrap:wrap">${tags}</div>
    </div>`;
  }

  function renderInanimateCard(fullItem) {
    const ch = fullItem?.character;
    if (!ch) return '';
    const idToken   = ch.id_token || '';
    const charName  = ch.name || ch.names || ch.username || 'Unknown';
    const nature    = ch.nature || '—';
    const permanent = ch.permanent ? '🔒 Yes' : 'No';
    const sealed    = ch.sealed   ? '🔐 Yes' : 'No';
    const tokenDisp = idToken ? idToken.substring(0, 24) + (idToken.length > 24 ? '…' : '') : '—';
    const profileUrl = idToken ? `https://battlemageserotica.com/character/${idToken}` : null;
    const profileLink = profileUrl
      ? `<a href="${profileUrl}" target="_blank" rel="noopener" class="bmr-profile-link">Open Profile ↗</a>`
      : '';
    return `<div class="bmr-inanimate-card">
      <h4>🧸 Trapped Character</h4>
      <div class="bmr-row"><span class="bmr-label">Name:</span> <b>${charName}</b></div>
      <div class="bmr-row">
        <span class="bmr-label">Nature:</span> ${nature} &nbsp;
        <span class="bmr-label">Permanent:</span> ${permanent} &nbsp;
        <span class="bmr-label">Sealed:</span> ${sealed}
      </div>
      <div class="bmr-row" style="font-size:10px">
        <span class="bmr-label">Token:</span>
        <span style="font-family:monospace;color:#666">${tokenDisp}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:2px">
        ${profileLink}
      </div>
    </div>`;
  }

  function bindCopy() {
    detailEl.querySelectorAll('.bmr-copy').forEach(btn => {
      btn.onclick = () => {
        navigator.clipboard.writeText(btn.dataset.copy).then(() => {
          const prev = btn.textContent;
          btn.textContent = '✓';
          setTimeout(() => btn.textContent = prev, 900);
        });
      };
    });
  }

  // ─── LOAD ────────────────────────────────────────────────────────────

  function loadItems(items, append) {
    const newItems = items.filter(i => i?.id && i?.image_url);
    if (append) {
      const existing = new Set(allItems.map(i => i.id));
      newItems.forEach(i => { if (!existing.has(i.id)) allItems.push(i); });
    } else {
      allItems = newItems;
    }
    allItems.sort((a, b) => a.id - b.id);
    statusEl.textContent = allItems.length + ' items';
    renderList(allItems);
  }

  // ── Passive catalog accumulator — captures all base items the game touches ──
  // Every time gm.GetBaseItem is called anywhere (vendor, inspect, render), we grab it.
  function captureBaseItem(baseItem) {
    if (!baseItem?.id || !baseItem?.image_url) return;
    if (allItems.find(i => i.id === baseItem.id)) return;
    allItems.push(baseItem);
    if (!captureBaseItem._t) {
      captureBaseItem._t = setTimeout(() => {
        captureBaseItem._t = null;
        allItems.sort((a, b) => a.id - b.id);
        statusEl.textContent = allItems.length + ' items (live)';
        const q = searchEl.value.toLowerCase();
        renderList(q ? allItems.filter(i =>
          (i.item_name || '').toLowerCase().includes(q) || String(i.id).includes(q)
        ) : allItems);
      }, 800);
    }
  }

  // (fetchItemCatalog removed — game has no public item-list endpoint;
  //  use discoverItemsFromLocation for live character data instead)

  // ── Inventory-based discovery (fast, runs immediately) ──
  const inventoryItems = discoverItemsFromInventory();
  loadItems(inventoryItems.length > 0 ? inventoryItems : []);
  if (inventoryItems.length === 0) statusEl.textContent = 'No items — use Scan / Deep Scan';

  // ── Also auto-grab items from all characters currently visible at your location ──
  try {
    const locItems = discoverItemsFromLocation();
    if (locItems.length > 0) loadItems(locItems, true);
  } catch(e) {}

  // ── Hook GetBaseItem to passively accumulate items as the game accesses them ──
  try {
    const _origGetBaseItem = gm.GetBaseItem.bind(gm);
    gm.GetBaseItem = function(itemOrId) {
      const result = _origGetBaseItem(itemOrId);
      if (result?.image_url && result?.id != null) captureBaseItem(result);
      return result;
    };
  } catch(e) {}

  // ── Deep scan button (supplements with base-ID scan) ──
  document.getElementById('bmr-scan-btn').addEventListener('click', () => {
    const btn = document.getElementById('bmr-scan-btn');
    btn.disabled = true;
    btn.textContent = 'Scanning…';
    const extra = [];
    scanItemsByID(
      (item, count) => {
        extra.push(item);
        progressEl.textContent = 'Found ' + count + ' extra items…';
      },
      (items) => {
        progressEl.textContent = '';
        btn.textContent = 'Done (' + items.length + ' extra)';
        if (items.length > 0) loadItems(items, true);
      }
    );
  });

  // ─── INANIMATE AUTO-CAPTURE ──────────────────────────────────────────
  // The game client stores OTHER players' items inside their character objects,
  // NOT in gm._items. We hook LOCATION.instance.Sync and SCENE.instance.SetCharacter
  // to intercept every character the server sends us and extract inanimate items.

  function harvestInanimateFromChar(char) {
    if (!char || typeof char !== 'object') return;
    // Case 1: the character IS an inanimate (they are trapped inside an item)
    //   char.item = the full instance item object containing char.character
    try {
      const ci = char.item;
      if (ci && ci.character?.id_token && ci.base?.image_url)
        addInanimateResult({ baseItem: ci.base, instanceId: ci.id, variantColor: ci.variant_color || null, fullItem: ci });
    } catch(e) {}
    // Case 2: the character wears items that are inanimate players
    const eq = char.equipment;
    const arr = Array.isArray(eq) ? eq
               : Array.isArray(eq?.items) ? eq.items
               : [];
    arr.forEach(item => {
      try {
        if (!item || typeof item !== 'object') return;
        // Fully resolved instance object
        if (item.character?.id_token && item.base?.image_url)
          addInanimateResult({ baseItem: item.base, instanceId: item.id, variantColor: item.variant_color || null, fullItem: item });
        // Item with base as integer — try resolving
        else if (typeof item.base === 'number') {
          const it = gm.GetItem(item.id);
          if (it?.character?.id_token && it?.base?.image_url)
            addInanimateResult({ baseItem: it.base, instanceId: it.id, variantColor: it.variant_color || null, fullItem: it });
        }
      } catch(e) {}
    });
  }

  function addInanimateResult(result) {
    if (!result?.instanceId) return;
    if (inanimateResults.find(r => r.instanceId === result.instanceId)) return;
    inanimateResults.push(result);
    // If the inanimate list is currently displayed, add row live
    if (listEl.querySelector('.bmr-item-row.inanimate')) {
      appendInanimateRow(result);
      statusEl.textContent = '🧸 ' + inanimateResults.length + ' found';
      document.getElementById('bmr-brute-status').textContent =
        inanimateResults.length + ' inanimate player' + (inanimateResults.length !== 1 ? 's' : '') + ' collected this session.';
    }
  }

  // Hook LOCATION.instance.Sync — fires every time the server sends location data
  // (entering a room, encountering someone, scene updates, etc.)
  function installLiveHooks() {
    try {
      const origSync = LOCATION.instance.Sync.bind(LOCATION.instance);
      LOCATION.instance.Sync = function(data) {
        const r = origSync(data);
        setTimeout(() => {
          try {
            [data?.character, data?.opponent, data?.player].forEach(harvestInanimateFromChar);
            if (Array.isArray(data?.players)) data.players.forEach(harvestInanimateFromChar);
          } catch(e) {}
        }, 0);
        return r;
      };
    } catch(e) {}

    // Hook SCENE.instance.SetCharacter — fires every time a character sprite is rendered
    try {
      const origSet = SCENE.instance.SetCharacter.bind(SCENE.instance);
      SCENE.instance.SetCharacter = async function(character, position, enterOrLeave) {
        if (character) setTimeout(() => harvestInanimateFromChar(character), 0);
        return origSet(character, position, enterOrLeave);
      };
    } catch(e) {}
  }
  installLiveHooks();

  // ─── TOKEN LOOKUP ─────────────────────────────────────────────────────
  // Opens MENU.Inspect for the token, then polls MENU.Inspect.character
  // (same pattern used by replace_mychar_with_token.js — most reliable).
  function inspectByToken(token) {
    token = (token || '').trim();
    if (!token) return;
    statusEl.textContent = 'Fetching…';
    detailEl.innerHTML = `<div style="padding:20px;color:#888;font-size:13px">Opening inspect for <span style="color:#e94560;font-family:monospace">${token.substring(0, 20)}</span>…</div>`;

    try {
      MENU.Inspect.Open(GUI.Position.Right, token);
    } catch(e) {
      statusEl.textContent = 'Error';
      detailEl.innerHTML = `<div style="color:#e94560;padding:20px;font-size:13px">MENU.Inspect.Open failed: ${e.message}</div>`;
      return;
    }

    const started = Date.now();
    const TIMEOUT_MS = 10000;
    const POLL_MS = 150;

    const timer = setInterval(() => {
      const char = MENU?.Inspect?.character;
      if (char && char.token === token) {
        clearInterval(timer);
        processInspectCharacter(char);
      } else if (Date.now() - started > TIMEOUT_MS) {
        clearInterval(timer);
        statusEl.textContent = 'Timeout';
        detailEl.innerHTML = `<div style="color:#e94560;padding:20px;font-size:13px">No response after ${TIMEOUT_MS / 1000}s — token may be invalid or not reachable.</div>`;
      }
    }, POLL_MS);
  }

  function processInspectCharacter(char) {
    // char is a proper Character object — same structure as location players
    console.log('[BMR Token Lookup] character:', char);
    const found = new Map();
    extractCharItems(found, char);
    harvestInanimateFromChar(char);
    const items = Array.from(found.values());
    const before = allItems.length;
    if (items.length > 0) loadItems(items, true);
    const added = allItems.length - before;
    const name = char.names || char.username || char.token;
    statusEl.textContent = added > 0 ? `+${added} from inspect` : 'No new items';
    detailEl.innerHTML = added > 0
      ? `<div style="padding:20px;color:#aaa;font-size:13px">Loaded <b style="color:#e94560">${added}</b> new item${added !== 1 ? 's' : ''} from <b>${name}</b> — check the list on the left.</div>`
      : `<div style="padding:20px;color:#888;font-size:13px"><b>${name}</b> appears to have nothing equipped, or items were already loaded.<br><small style="color:#555">Character object logged to console.</small></div>`;
  }

  // ── Find Inanimate Players button (quick snapshot of all currently known chars) ──
  document.getElementById('bmr-inanim-btn').addEventListener('click', () => {
    const btn = document.getElementById('bmr-inanim-btn');
    btn.disabled = true;
    // Also harvest from all currently visible chars before showing
    const chars = new Set();
    try { const v = LOCATION.instance?.opponent; if (v) chars.add(v); } catch(e) {}
    try { const v = LOCATION.instance?.player;   if (v) chars.add(v); } catch(e) {}
    try { const v = gm.owner;                    if (v) chars.add(v); } catch(e) {}
    try { const ps = LOCATION.instance?.players; if (Array.isArray(ps)) ps.forEach(p => p && chars.add(p)); } catch(e) {}
    try { (gm.recentCharacters || []).forEach(c => c && chars.add(c)); } catch(e) {}
    try { for (let pos = 0; pos < 4; pos++) { const c = SCENE.instance?.GetDisplayedCharacter(pos); if (c) chars.add(c); } } catch(e) {}
    chars.forEach(harvestInanimateFromChar);
    setTimeout(() => {
      if (inanimateResults.length > 0) {
        renderInanimateList(inanimateResults);
        statusEl.textContent = '🧸 ' + inanimateResults.length + ' inanimate';
        progressEl.textContent = '';
        document.getElementById('bmr-brute-status').textContent =
          inanimateResults.length + ' inanimate player' + (inanimateResults.length !== 1 ? 's' : '') + ' collected this session.';
      } else {
        progressEl.textContent = 'None yet — the hooks are running. Walk around and they’ll appear automatically.';
      }
      btn.textContent = '🧸 Find Inanimate Players';
      btn.disabled = false;
    }, 30);
  });
  document.getElementById('bmr-loc-btn').addEventListener('click', () => {
    const btn = document.getElementById('bmr-loc-btn');
    btn.disabled = true;
    progressEl.textContent = 'Scanning characters at current location…';
    const found = discoverItemsFromLocation();
    const before = allItems.length;
    if (found.length > 0) loadItems(found, true);
    const added = allItems.length - before;
    progressEl.textContent = added > 0 ? `Added ${added} new items from location.` : 'No new items found at location.';
    btn.textContent = 'Scan Location Players';
    btn.disabled = false;
  });

  // ── Snapshot Current Location button ──
  document.getElementById('bmr-brute-btn').addEventListener('click', () => {
    const bStatus = document.getElementById('bmr-brute-status');
    // Harvest everything visible RIGHT NOW
    const chars = new Set();
    try { const v = LOCATION.instance?.opponent; if (v) chars.add(v); } catch(e) {}
    try { const v = LOCATION.instance?.player;   if (v) chars.add(v); } catch(e) {}
    try { const v = gm.owner;                    if (v) chars.add(v); } catch(e) {}
    try { const ps = LOCATION.instance?.players; if (Array.isArray(ps)) ps.forEach(p => p && chars.add(p)); } catch(e) {}
    try { (gm.recentCharacters || []).forEach(c => c && chars.add(c)); } catch(e) {}
    try { for (let pos = 0; pos < 4; pos++) { const c = SCENE.instance?.GetDisplayedCharacter(pos); if (c) chars.add(c); } } catch(e) {}
    // Also sweep own _items in case any of your own held/stored items are inanimate
    try { (gm.GetItemIds() || []).forEach(id => { const it = gm.GetItem(id); if (it?.character?.id_token && it?.base?.image_url) addInanimateResult({ baseItem: it.base, instanceId: id, variantColor: it.variant_color, fullItem: it }); }); } catch(e) {}
    const before = inanimateResults.length;
    chars.forEach(harvestInanimateFromChar);
    const added = inanimateResults.length - before;
    bStatus.textContent = `Snapshot done. +${added} new. Total: ${inanimateResults.length} inanimate player${inanimateResults.length !== 1 ? 's' : ''} this session.`;
    if (inanimateResults.length > 0) {
      renderInanimateList(inanimateResults);
      statusEl.textContent = '🧸 ' + inanimateResults.length + ' inanimate';
    }
  });

  function appendInanimateRow({ baseItem, instanceId, variantColor, fullItem }) {
    const ch = fullItem?.character;
    const charName = ch?.name || ch?.names || ch?.username || '?';
    const row = document.createElement('div');
    row.className = 'bmr-item-row inanimate';
    row.innerHTML = `
      <img class="bmr-item-thumb" src="${baseItem.image_url || ''}" onerror="this.style.opacity='.15'">
      <div style="min-width:0">
        <div class="bmr-item-name" title="${baseItem.item_name || ''}">${baseItem.item_name || '(item)'}</div>
        <div class="bmr-inanim-charname">🧸 ${charName}</div>
        <div class="bmr-item-id">Instance #${instanceId}</div>
      </div>
    `;
    row.addEventListener('click', () => {
      if (activeRow) activeRow.classList.remove('active');
      activeRow = row;
      row.classList.add('active');
      renderDetail(baseItem, { instanceId, variantColor, fullItem });
    });
    listEl.appendChild(row);
  }

  // ── Token lookup button / Enter key ──
  document.getElementById('bmr-token-btn').addEventListener('click', () => inspectByToken(document.getElementById('bmr-token-input').value));
  document.getElementById('bmr-token-input').addEventListener('keydown', e => { if (e.key === 'Enter') inspectByToken(document.getElementById('bmr-token-input').value); });

  // ── Lookup button / Enter key ──
  lookupBtn.addEventListener('click', () => lookupItemById(lookupInput.value));
  lookupInput.addEventListener('keydown', e => { if (e.key === 'Enter') lookupItemById(lookupInput.value); });

  // Close / toggle
  document.getElementById('bmr-fitbox-close').addEventListener('click', () => {
    panel.style.display = 'none';
  });

  window.__BMR_FITTING_BOX = {
    toggle() { panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; },
    close()  { panel.style.display = 'none'; }
  };

  console.log('BMR Fitting Box ready. Run script again to toggle.');
})();
