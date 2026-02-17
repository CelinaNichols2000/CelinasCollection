// ====================================================================
// SELFTF - Self Transformation (CLEAN VERSION - Visual Only)
// ====================================================================

(() => {
  const gm = GAME_MANAGER.instance;
  const gui = GUI.instance;
  
  const CONFIG = {
    sakuraToken: 'd97387afa03b7445dc56f588be3269314ab0019f',
    yourToken: '037095834745f61d3aa66090769b1de283823a18',
    inanimateName: 'Pathetic Cumcovered Smutty Asshugger',
    baseId: 137,
    color: 'Purple',
    permanent: true,
    sealed: false,
    colorHexMap: {
      'Purple': '#9B59B6', 'Black': '#000000', 'White': '#FFFFFF', 'Red': '#E74C3C',
      'Pink': '#FF69B4', 'Blue': '#3498DB', 'Green': '#2ECC71', 'Yellow': '#F1C40F',
      'Orange': '#E67E22', 'Brown': '#8B4513', 'Gray': '#95A5A6', 'Teal': '#1ABC9C',
      'Cyan': '#00FFFF', 'Magenta': '#FF00FF', 'Lime': '#00FF00', 'Navy': '#000080',
      'Maroon': '#800000', 'Olive': '#808000', 'Gold': '#FFD700', 'Silver': '#C0C0C0',
      'Beige': '#F5F5DC', 'Tan': '#D2B48C'
    }
  };
  
  const STATIC_OWNER = {
    background: 0, effects: [], physique: [255, 0, 0], skin: [0, 0], skin_color: 0,
    head: [0, 0, 8, 0, 0], head_flags: 0, body: [0, 0, 8, 0], height: 0, body_flags: 0,
    hair: [0, 0, 0, 0, 0, 0], hair_flags: 0, genitalia: 2, genitalia_size: 0,
    breasts: [4, 0, 0, 0], training: [0, 0, 0], lip_size: 0,
    makeup: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    names: "Celina Nichols", nature: "sexy", token: CONFIG.sakuraToken,
    abilities: [], cards: [], passives: [], username: "Celina2000",
    username_color: "#9B59B6", tier: 3, equipment: [],
    filter: { absorption: true, animal: true, anthro: true, inanimate: true, monster: true, sissification: false, transgender: true },
    sexuality: 7, desires: {},
    stats: { strength: 10, dexterity: 10.67, intelligence: 10.77, willpower: 13.77, body: 0, mind: 0, action: 0, spell: 0.23, hit: 0.67, evasion: 0, penetration: 3.52, resistance: 0 },
    status: { body: 500, maxBody: 500, mind: 538, maxMind: 538, lust: 0, roleplaying: true, effects: [] }
  };
  
  const BASE_ITEM = {
    id: 137, item_name: "Thong",
    image_url: "https://battlemageserotica.com/game/assets/items/panties_thong.png",
    type: "equipment", singular: "a", group: 18, width: 2, height: 3,
    color_variants: ["*"], accessory_variants: ["*"],
    slots: ["shirt", "undershirt"], types: ["equipment"], flags: [], stack: 1, nsfw: false
  };
  
  let enabled = false;
  let currentOwner = null;
  
  function installColorPatch() {
    if (window.formatMediaURL && !window.formatMediaURL._colorPatched) {
      const orig = window.formatMediaURL;
      window.formatMediaURL = function(url, size, color) {
        if (color === false || color === undefined || color === null) return orig(url, size, color);
        return orig(url, size, color);
      };
      window.formatMediaURL._colorPatched = true;
    }
    if (window.IMAGE_PROCESSING?.getWornItemImage && !IMAGE_PROCESSING.getWornItemImage._colorPatched) {
      const orig = IMAGE_PROCESSING.getWornItemImage;
      IMAGE_PROCESSING.getWornItemImage = function(item, tier = 0, sprite = null, size = 0, scale = 0, pixelated = false) {
        const forcedColor = item.base.color_variants && item.variant_color ? nameToRef(item.variant_color) : undefined;
        return formatMediaURL(sprite || item.base.worn_image_url || item.base.image_url, pixelated ? 16 : powCeil(size * (scale || getMediaScale())), forcedColor);
      };
      IMAGE_PROCESSING.getWornItemImage._colorPatched = true;
    }
    if (window.IMAGE_PROCESSING?.getItemImage && !IMAGE_PROCESSING.getItemImage._colorPatched) {
      const orig = IMAGE_PROCESSING.getItemImage;
      IMAGE_PROCESSING.getItemImage = function(item, tier = 0, size = 0, scale = 0, pixelated = false) {
        const forcedColor = item.base.color_variants && item.variant_color ? nameToRef(item.variant_color) : undefined;
        return formatMediaURL(item.base.image_url, pixelated ? 16 : powCeil(size * (scale || getMediaScale())), forcedColor);
      };
      IMAGE_PROCESSING.getItemImage._colorPatched = true;
    }
  }

  function installSupportTierPatch() {
    const gm = GAME_MANAGER.instance;
    if (!gm || gm.Request._tierPatched) return;
    const realRequest = gm.Request.bind(gm);
    gm.Request = async (url, params = null, symbol = false) => {
      if (String(url).includes("/api/user/getsupporttier.php")) return {tier: 2, username: 'Celina2000', success: true};
      return realRequest(url, params, symbol);
    };
    gm.Request._tierPatched = true;
  }
  
  function fixSceneControllerNSFWError() {
    if (window.__sceneControllerNSFWFixed) return;
    const patchGetBaseItem = () => {
      if (!GAME_MANAGER?.instance?.GetBaseItem) { setTimeout(patchGetBaseItem, 50); return; }
      const gm = GAME_MANAGER.instance;
      const orig = gm.GetBaseItem.bind(gm);
      gm.GetBaseItem = function(itemOrId) {
        let result = orig(itemOrId);
        if (!result && itemOrId && typeof itemOrId === 'object') {
          if (itemOrId.character?.id_token === CONFIG.yourToken) return BASE_ITEM;
          if (itemOrId.base && typeof itemOrId.base === 'object') return itemOrId.base;
        }
        if (!result && itemOrId?.base === CONFIG.baseId) return BASE_ITEM;
        return result || (itemOrId?.base && typeof itemOrId.base === 'object' ? itemOrId.base : null);
      };
      window.__sceneControllerNSFWFixed = true;
    };
    patchGetBaseItem();
  }
  
  async function applyVisualMorph() {
    try {
      if (!GUI?.instance?.MorphCharacter) await new Promise(r => setTimeout(r, 1000));
      const char = currentOwner || LOCATION.instance?.player;
      if (!char) return;
      await GUI.instance.MorphCharacter(char, BASE_ITEM.image_url, { details: {}, image: BASE_ITEM.image_url }, CONFIG.color, BASE_ITEM.nsfw || false, false);
      setTimeout(() => {
        if (MENU?.Inventory?.Redraw) MENU.Inventory.Redraw();
        if (MENU?.Spells?.Redraw) MENU.Spells.Redraw();
        if (SCENE?.instance?.UpdateLocation) SCENE.instance.UpdateLocation(LOCATION.instance);
      }, 500);
    } catch (e) {}
  }
  
  async function forceLocationReload() {
    try {
      if (SCENE?.instance?.ShowCharacter && currentOwner) await SCENE.instance.ShowCharacter(currentOwner, 0, false);
      if (SCENE?.instance?.ClearCharacter) await SCENE.instance.ClearCharacter(1);
      if (GUI?.instance) {
        if (GUI.instance.action_bar?.Refresh) GUI.instance.action_bar.Refresh();
        if (GUI.instance.action_hub?.Refresh) GUI.instance.action_hub.Refresh();
      }
    } catch (e) {}
  }
  
  async function enableInanimateMode(ownerChar) {
    installColorPatch();
    installSupportTierPatch();
    currentOwner = ownerChar;
    const charToMorph = SCENE?.instance?.GetDisplayedCharacter?.(0) || LOCATION.instance?.player || gm.character;
    if (GUI?.instance?.MorphCharacter && charToMorph) {
      await GUI.instance.MorphCharacter(charToMorph, BASE_ITEM.image_url, { details: {}, image: BASE_ITEM.image_url }, CONFIG.color, BASE_ITEM.nsfw || false, false);
    }
    await new Promise(r => setTimeout(r, 3000));
    if (!ownerChar || !gm.character) return false;
    fixSceneControllerNSFWError();
    enabled = true;
    installOwnerFallbackHook();
    const inanimateItem = {
      id: Math.floor(Math.random() * 10000000), stack: 0, base: BASE_ITEM, flags: 0,
      character: { permanent: CONFIG.permanent, sealed: CONFIG.sealed, name: CONFIG.inanimateName, nature: gm.character.nature || 'sexy', id_token: gm.character.token },
      enchantments: [], attributes: 0, variant_color: CONFIG.color, variant_accessory: null,
      inanimate_actions: [
        { id: 23, action_name: "Excited", tags: ["Inanimate"], description: "Wiggle and shiver excitedly.", action_cost: 1 },
        { id: 24, action_name: "Submit", tags: ["Inanimate"], description: "Embrace your owner submissively.", action_cost: 1 },
        { id: 25, action_name: "Affectionate", tags: ["Inanimate"], description: "Embrace your owner affectionately.", action_cost: 1 },
        { id: 26, action_name: "Reluctant", tags: ["Inanimate"], description: "Embrace your owner reluctantly.", action_cost: 1 },
        { id: 27, action_name: "Defiant", tags: ["Inanimate"], description: "Writhe and struggle defiantly.", action_cost: 1 },
        { id: 28, action_name: "Indignant", tags: ["Inanimate"], description: "Writhe and wriggle indignantly.", action_cost: 1 },
        { id: 29, action_name: "Bewildered", tags: ["Inanimate"], description: "Writhe and wriggle bewilderedly.", action_cost: 1 },
        { id: 30, action_name: "Apprehension", tags: ["Inanimate"], description: "Cower and quiver anxiously.", action_cost: 1 }
      ]
    };
    if (!ownerChar.equipment) ownerChar.equipment = [];
    ownerChar.equipment = ownerChar.equipment.filter(item => !(item?.character?.id_token === gm.character.token));
    ownerChar.equipment.push(inanimateItem);
    gm.character.item = inanimateItem;
    fixInanimateItemBase();
    installSceneControllerPatch();
    await new Promise(r => setTimeout(r, 500));
    await forceLocationReload();
    return true;
  }
  
  function installSceneControllerPatch() {
    if (window.__sceneControllerPatched) return;
    const p = () => {
      if (!SCENE?.instance?.ShowCharacter) { setTimeout(p, 100); return; }
      const orig = SCENE.instance.ShowCharacter.bind(SCENE.instance);
      SCENE.instance.ShowCharacter = async function(character, position, enter) {
        if (enabled && currentOwner && character && character.token === gm.character.token && gm.character.item) {
          return orig(currentOwner, position, enter);
        }
        return orig(character, position, enter);
      };
    };
    p();
    window.__sceneControllerPatched = true;
  }
  
  function installOwnerFallbackHook() {
    if (window.__ownerFallbackHooked) return;
    const originalGM = window.GAME_MANAGER;
    const proxyGM = new Proxy(originalGM, {
      get(target, prop) {
        if (prop === 'instance') {
          const realInstance = target.instance;
          return new Proxy(realInstance, {
            get(instanceTarget, instanceProp) {
              if (instanceProp === 'owner' && enabled && currentOwner) return currentOwner;
              if (instanceProp === 'Send' && enabled) {
                const origSend = instanceTarget.Send.bind(instanceTarget);
                return function(type, data) {
                  if (type === 'Location' || type === 'LocalChat' || type === 'Chat') {
                    gui.DisplayMessage("You are inanimate");
                    return;
                  }
                  return origSend(type, data);
                };
              }
              return instanceTarget[instanceProp];
            }
          });
        }
        return target[prop];
      }
    });
    try { window.GAME_MANAGER = proxyGM; } catch (e) {}
    window.__ownerFallbackHooked = true;
  }
  
  function fixInanimateItemBase() {
    if (!gm.character?.item) return;
    const item = gm.character.item;
    let _baseValue = (typeof item.base === 'object' && item.base) ? item.base : BASE_ITEM;
    try {
      Object.defineProperty(item, 'base', {
        get() {
          if (typeof _baseValue === 'number' && (_baseValue === CONFIG.baseId || _baseValue === 137)) return BASE_ITEM;
          if (!_baseValue || typeof _baseValue !== 'object') return BASE_ITEM;
          return _baseValue;
        },
        set(value) {
          if (typeof value === 'number' && (value === CONFIG.baseId || value === 137)) _baseValue = BASE_ITEM;
          else if (value && typeof value === 'object') _baseValue = value;
          else if (!value) _baseValue = BASE_ITEM;
        },
        configurable: true
      });
    } catch (e) {}
  }
  
  function disableInanimateMode() {
    if (!enabled) return;
    if (currentOwner?.equipment) currentOwner.equipment = currentOwner.equipment.filter(i => !(i?.character?.id_token === gm.character?.token));
    if (gm.character?.item?.character?.id_token === gm.character.token) delete gm.character.item;
    currentOwner = null;
    enabled = false;
    gui.DisplayMessage('✓ Back to normal');
  }
  
  async function changeColor(newColor) {
    if (!CONFIG.colorHexMap[newColor]) return false;
    CONFIG.color = newColor;
    if (gm.character?.item) gm.character.item.variant_color = newColor;
    if (currentOwner?.equipment) {
      const myItem = currentOwner.equipment.find(i => i?.character?.id_token === gm.character?.token);
      if (myItem) myItem.variant_color = newColor;
    }
    await applyVisualMorph();
    await forceLocationReload();
    gui.DisplayMessage('✓ Color: ' + newColor);
    return true;
  }
  
  window.SELFTF = {
    enableWithStaticOwner() { return enableInanimateMode(STATIC_OWNER); },
    async changeColor(newColor) { return await changeColor(newColor); },
    listColors() {
      console.log('\n╔════ AVAILABLE COLORS ════╗');
      Object.keys(CONFIG.colorHexMap).forEach(color => console.log('  •', color, '→', CONFIG.colorHexMap[color]));
      console.log('╚══════════════════════════╝\n');
    },
    async reapplyVisuals() { await applyVisualMorph(); await forceLocationReload(); },
    enable(owner) { if (!owner || (!owner.names && !owner.name)) return false; return enableInanimateMode(owner); },
    disable() { disableInanimateMode(); },
    status() {
      console.log('\n╔════ SELFTF STATUS ════╗');
      console.log('Enabled:', enabled);
      console.log('You:', gm.character?.names || gm.character?.name);
      console.log('Owner:', currentOwner?.names || currentOwner?.name || 'None');
      console.log('gm.inanimate:', gm.inanimate);
      console.log('character.item:', !!gm.character?.item);
      console.log('╚═══════════════════════╝\n');
    },
    isEnabled() { return enabled; }
  };
  
  console.log('SELFTF Ready - Use: SELFTF.enableWithStaticOwner()');
})();
